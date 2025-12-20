import React, { useState, useEffect, useRef } from 'react';
import { Address } from '../types';
import { X, MapPin, Save, Map as MapIcon } from 'lucide-react';

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
  const [location, setLocation] = useState<{lat: number, lng: number}>({
    lat: initialAddress?.lat || 35.6892, 
    lng: initialAddress?.lng || 51.3890
  });
  
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const leaflet = (window as any).L;
    if (!leaflet) return;

    mapRef.current = leaflet.map('map-container').setView([location.lat, location.lng], 13);
    
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
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

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh]">
        {/* Map Section */}
        <div className="flex-grow h-64 md:h-full relative bg-slate-800">
          <div id="map-container" className="absolute inset-0 z-0"></div>
          <div className="absolute top-4 right-4 z-[1] bg-slate-900/90 p-2 rounded-xl border border-slate-700 text-xs text-white">
            موقعیت دقیق را روی نقشه انتخاب کنید
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-[400px] p-8 flex flex-col justify-between border-r border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="text-pharmacy-500" />
                {initialAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}
              </h3>
              <button onClick={onCancel} className="text-slate-500 hover:text-white">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-2">عنوان آدرس (مثلاً: خانه، محل کار)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white outline-none focus:border-pharmacy-500" 
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-2">شهر</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white outline-none" 
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-2">کد پستی</label>
                  <input 
                    type="text" 
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white outline-none focus:border-pharmacy-500 text-left dir-ltr" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-2">آدرس دقیق پستی</label>
                <textarea 
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-white outline-none focus:border-pharmacy-500 resize-none" 
                  required
                />
              </div>
            </form>
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-pharmacy-500 hover:bg-pharmacy-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-pharmacy-500/20"
          >
            <Save className="w-5 h-5" />
            {initialAddress ? 'بروزرسانی آدرس' : 'ذخیره این آدرس'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;