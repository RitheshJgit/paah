function DonationCard({ donation }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold capitalize">{donation.type}</h2>

      {/* 🔥 TYPE-BASED DISPLAY */}

      {donation.type === "money" && (
        <p>Amount: ₹ {donation.amount}</p>
      )}

      {donation.type === "clothes" && (
        <p>Clothes: {donation.weight} kg</p>
      )}

      {donation.type === "books" && (
        <p>Books: {donation.quantity}</p>
      )}

      {donation.type === "other" && (
        <p>Item: {donation.itemName}</p>
      )}

      {donation.proofImage && (
  <img
    src={`http://localhost:8000/uploads/${donation.proofImage}`}
    alt="proof"
    className="mt-2 w-40 rounded"
  />
)}

      {/* STATUS */}
      <p className="text-sm mt-2">
        Status:{" "}
        <strong
          className={
            donation.status === "approved"
              ? "text-green-600"
              : donation.status === "rejected"
              ? "text-red-600"
              : "text-yellow-600"
          }
        >
          {donation.status}
        </strong>
      </p>

      {/* POINTS */}
      <p className="text-sm">
        Points:{" "}
        {donation.status === "pending"
          ? "Pending"
          : donation.finalPoints ?? 0}
      </p>
    </div>
  );
}

export default DonationCard;