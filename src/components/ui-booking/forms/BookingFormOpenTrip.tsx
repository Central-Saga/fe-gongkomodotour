// src/components/ui/ui-booking/BookingFormOpenTrip.tsx
export default function BookingFormOpenTrip() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">Data Diri Pemesan (Open Trip)</h3>
      <input type="text" placeholder="Mr" className="w-full p-2 border rounded" />
      <input type="text" placeholder="Name" className="w-full p-2 border rounded" />
      <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
      <div className="flex space-x-2">
        <select className="w-1/4 p-2 border rounded">
          <option>+62</option>
        </select>
        <input type="text" placeholder="No. WhatsApp" className="w-3/4 p-2 border rounded" />
      </div>
      <input type="text" placeholder="Address" className="w-full p-2 border rounded" />
      <input type="text" placeholder="Country" className="w-full p-2 border rounded" />
      <textarea placeholder="Catatan Tambahan" className="w-full p-2 border rounded" rows={3}></textarea>
    </div>
  );
}