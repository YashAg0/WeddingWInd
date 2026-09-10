import { toWeddingDTO } from "@/lib/wedding-dto";

describe("Single Source of Truth Wedding DTO Normalizer", () => {
  it("should normalize raw DB wedding record into a consistent DTO", () => {
    const rawDBRecord = {
      id: "w-test-1",
      slug: "test-wedding-slug",
      title: "Maharaja Royal Nuptials",
      description: "Exclusive royal palace experience.",
      location: "Umaid Bhawan Palace, Jodhpur, Rajasthan",
      category: "Royal",
      religion: "Hindu",
      region: "Rajasthan",
      community: "Rajput",
      tier: "ROYAL",
      durationDays: 3,
      pricePerGuest: 17999,
      capacity: 20,
      guestsAllowed: 20,
      mainImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
      status: "PUBLISHED",
      featured: true,
      sponsored: false,
      isDemo: false,
      date: new Date("2026-11-18T00:00:00.000Z"),
      hostCouple: {
        id: "couple-1",
        name: "Devika & Kaber Singhania",
        familyBio: "Singhania Royal Family",
        languagesSpoken: "English, Hindi, Marwari",
        user: {
          id: "u-1",
          name: "Devika & Kaber Singhania",
          avatar: "https://images.unsplash.com/photo-1615966650071",
          verification: {
            status: "APPROVED",
          },
        },
      },
      gallery: [{ imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a" }],
      events: [
        {
          id: "evt-1",
          name: "Sangeet Night",
          startTime: "18:00",
          endTime: "22:00",
          date: new Date("2026-11-17T00:00:00.000Z"),
          description: "Lively music evening",
        },
      ],
      traditions: [
        { name: "Saptapadi", description: "Seven sacred vows" }
      ],
      _count: {
        bookings: 5
      }
    };

    const dto = toWeddingDTO(rawDBRecord);

    expect(dto.id).toBe("w-test-1");
    expect(dto.slug).toBe("test-wedding-slug");
    expect(dto.religion).toBe("Hindu");
    expect(dto.region).toBe("Rajasthan");
    expect(dto.community).toBe("Rajput");
    expect(dto.pricePerGuest).toBe(649);
    expect(dto.currency).toBe("USD");
    expect(dto.guestsAllowed).toBe(20);
    expect(dto.guestsBooked).toBe(5);
    expect(dto.hostName).toBe("Devika & Kaber Singhania");
    expect(dto.coupleImage).toBe("https://images.unsplash.com/photo-1583939003579-730e3918a45a");
    expect(dto.date).toBe("2026-11-18");
    expect(dto.isDemo).toBe(false);
  });

  it("should enforce canonical religion and resolve fallback cultural defaults for incomplete records", () => {
    const rawIncomplete = {
      id: "w-test-2",
      slug: "kashmiri-lake-wedding",
      title: "Dal Lake Kashmiri Wedding",
      location: "Srinagar, Kashmir",
      category: "Destination",
      religion: "Muslim",
      pricePerGuest: 14000,
      capacity: 15,
      mainImageUrl: "https://images.unsplash.com/photo-1548013146",
      status: "PUBLISHED",
      isDemo: true,
      date: "2027-10-10",
    };

    const dto = toWeddingDTO(rawIncomplete);

    expect(dto.religion).toBe("Muslim");
    expect(dto.region).toBe("Kashmir");
    expect(dto.foodContext).toContain("Wazwan");
    expect(dto.dressExpectations).toContain("Pheran");
    expect(dto.etiquetteNotes).toContain("Trami");
    expect(dto.isDemo).toBe(true);
  });
});
