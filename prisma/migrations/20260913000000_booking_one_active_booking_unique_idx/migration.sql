-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_one_active_booking_per_wedding_traveler_unique_idx"
ON "Booking"("weddingId", "travelerId")
WHERE status NOT IN ('CANCELLED', 'REFUNDED');
