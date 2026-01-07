
import React, { useState, useEffect, useRef } from 'react';
import { Address } from '../types';
import { X, MapPin, Save, Map as MapIcon, Search, CheckCircle } from 'lucide-react';

interface AddressFormProps {
  initialAddress?: Address | null;
  onSave: (address: Address) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialAddress, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialAddress?.title || '');
  const [city, setCity] = useState(initialAddress?.city || 'تهران');
  const [fullAddress, setFullAddress] = useState(initialAddress?.fullAddress || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || '');
  
  // Location selection states
  const [location, setLocation] = useState<{lat: number, lng: number}>(
    initialAddress ? { lat: initialAddress.lat, lng: initialAddress.lng } : { lat: 35.6892, lng: 51.3890 }
  );
  const [isLocationSelected, setIsLocationSelected] = useState(!!initialAddress);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // Search state for map
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Map when Modal Opens
  useEffect(() => {
    if (isMapOpen) {
        setTimeout(() => {
            const leaflet = (window as any).L;
            if (!leaflet) return;
            
            // If map already initialized, just resize
            if (mapRef.current) {
                mapRef.current.invalidateSize();
                return;
            }

            mapRef.current = leaflet.map('map-container', {
                zoomControl: false // We can add custom zoom controls if needed, or rely on touch/scroll
            }).setView([location.lat, location.lng], 13);
            
            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap'
            }).addTo(mapRef.current);

            // Add Zoom Control to bottom right
            leaflet.control.zoom({
                position: 'bottomright'
            }).addTo(mapRef.current);

            markerRef.current = leaflet.marker([location.lat, location.lng], {
              draggable: true
            }).addTo(mapRef.current);

            markerRef.current.on('dragend', (e: any) => {
              const pos = e.target.getLatLng();
              setLocation({ lat: pos.lat, lng: pos.lng });
            });

            mapRef.current.on('click', (e: any) => {
              markerRef.current.setLatLng(e.latlng);
              setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
            });
        }, 100);
    }
  }, [isMapOpen]);

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&accept-language=fa`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if(data && data.length > 0) {
            const { lat, lon } = data[0];
            const newLat = parseFloat(lat);
            const newLng = parseFloat(lon);
            setLocation({ lat: newLat, lng: newLng });
            
            if(mapRef.current && markerRef.current) {
                mapRef.current.setView([newLat, newLng], 15);
                markerRef.current.setLatLng([newLat, newLng]);
            }
        } else {
            alert('موقعیتی یافت نشد.');
        }
    } catch (error) {
        console.error("Search failed", error);
        alert('خطا در جستجو: لطفاً اتصال اینترنت خود را بررسی کنید.');
    } finally {
        setIsSearching(false);
    }
  };

  const handleConfirmLocation = () => {
      setIsLocationSelected(true);
      setIsMapOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!title || !fullAddress || !postalCode) {
        alert('لطفاً تمام فیلدها را پر کنید.');
        return;
    }

    if (!/^\d{10}$/.test(postalCode)) {
        alert('کد پستی باید دقیقاً ۱۰ رقم باشد.');
        return;
    }

    if (!isLocationSelected) {
        alert('لطفاً موقعیت را روی نقشه مشخص کنید.');
        return;
    }

    onSave({
      id: initialAddress?.id || Math.random().toString(36).substr(2, 9),
      title,
      city,
      province: 'تهران',
      fullAddress,
      postalCode,
      ...location
    });
  };

  return (
    <>
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="text-pharmacy-500" />
                    {initialAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
                </h3>
                <button onClick={onCancel} className="text-slate-500 hover:text-white">
                    <X />
                </button>
            </div>

            {/* Form Fields */}
            <div className="p-8 space-y-5">
                <form onSubmit={handleSubmit} id="addr-form" className="space-y-5">
                    <div>
                        <label className="block text-slate-400 text-xs mb-2">عنوان آدرس <span className="text-rose-500">*</span></label>
                        <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 transition-colors" 
                        placeholder="مثال: خانه، محل کار"
                        required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-slate-400 text-xs mb-2">شهر <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-300 outline-none cursor-not-allowed" 
                            readOnly
                        />
                        </div>
                        <div>
                        <label className="block text-slate-400 text-xs mb-2">کد پستی (۱۰ رقم) <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            value={postalCode}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPostalCode(val);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 text-left dir-ltr tracking-widest font-mono transition-colors" 
                            placeholder="__________"
                            required
                            pattern="\d{10}"
                            title="کد پستی باید ۱۰ رقم باشد"
                        />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-slate-400 text-xs mb-2">آدرس دقیق پستی <span className="text-rose-500">*</span></label>
                        <textarea 
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white outline-none focus:border-pharmacy-500 resize-none transition-colors" 
                        placeholder="خیابان، کوچه، پلاک، واحد..."
                        required
                        />
                    </div>

                    {/* Map Trigger Button */}
                    <div className="pt-2">
                        <label className="block text-slate-400 text-xs mb-2">موقعیت روی نقشه <span className="text-rose-500">*</span></label>
                        <button 
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all group ${
                                isLocationSelected 
                                ? 'border-pharmacy-500 bg-pharmacy-500/10 text-white' 
                                : 'border-slate-600 hover:border-pharmacy-500 text-slate-400 hover:text-white'
                            }`}
                        >
                            {isLocationSelected ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-pharmacy-500" />
                                    <span>موقعیت انتخاب شد (تغییر)</span>
                                </>
                            ) : (
                                <>
                                    <MapIcon className="w-5 h-5 group-hover:text-pharmacy-500" />
                                    <span>انتخاب موقعیت روی نقشه</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <button 
                    type="submit"
                    form="addr-form"
                    className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pharmacy-500/20 mt-4 active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    {initialAddress ? 'بروزرسانی آدرس' : 'ذخیره آدرس'}
                </button>
            </div>
        </div>
        </div>

        {/* --- Map Selection Modal --- */}
        {isMapOpen && (
             <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
                 <div className="bg-slate-900 w-full h-full max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col relative border-2 border-slate-600 shadow-2xl">
                     
                     {/* Map Search Bar Overlay - High Z-Index to stay above Leaflet controls (z=1000) */}
                     <div className="absolute top-4 left-4 right-4 z-[2000] flex gap-2">
                         <form onSubmit={handleSearchLocation} className="flex-grow relative shadow-2xl">
                             <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="جستجوی شهر، خیابان..."
                                className="w-full h-14 rounded-2xl pl-4 pr-14 bg-white text-slate-900 border-2 border-slate-200 outline-none font-bold shadow-sm focus:border-pharmacy-500 transition-colors"
                             />
                             <button type="submit" className="absolute right-1 top-1 h-12 w-12 flex items-center justify-center text-slate-500 hover:text-pharmacy-600 rounded-xl hover:bg-slate-50 transition-colors">
                                {isSearching ? <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> : <Search className="w-6 h-6" />}
                             </button>
                         </form>
                         <button 
                            onClick={() => setIsMapOpen(false)}
                            className="h-14 w-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-600 transition-colors"
                         >
                             <X className="w-6 h-6" />
                         </button>
                     </div>

                     {/* The Map */}
                     <div id="map-container" className="flex-grow w-full h-full bg-slate-200 z-[100]"></div>

                     {/* Confirm Button Overlay - High Z-Index */}
                     <div className="absolute bottom-6 left-6 right-6 z-[2000] pointer-events-none flex justify-center">
                         <button 
                            onClick={handleConfirmLocation}
                            className="pointer-events-auto w-full md:w-auto md:min-w-[300px] bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl shadow-pharmacy-500/40 text-lg transition-transform hover:scale-[1.02] active:scale-95 border-2 border-white/20"
                         >
                             تایید این موقعیت
                         </button>
                     </div>
                 </div>
             </div>
        )}
    </>
  );
};

export default AddressForm;
