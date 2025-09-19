import { db } from "@/schema/db";
import { reviews } from "@/schema/schema";

import { businessId } from "./businesses";

export async function up() {
  console.log("Seeding reviews table...");

  await db.insert(reviews).values([
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2sxQ2FrSlZja0pJUlVkT1pUQTVPVU5KU1VGbVRHYxAB",
      author_name: "Mieke Kanmacher",
      author_image:
        "https://lh3.googleusercontent.com/a/ACg8ocIzCOMaCyCQc-teQJ56DNcJSsatDKVaMKXL2BopyZtAtAjjlw=s120-c-rp-mo-br100",
      datetime: new Date("2025-07-26T20:53:26.118Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2sxQ2FrSlZja0pJUlVkT1pUQTVPVU5KU1VGbVRHYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOk1CakJVckJIRUdOZTA5OUNJSUFmTGc%7C0cWFV563DT9%7C?hl=en",
      rating: 5,
      comments: null,
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT214QmJEbDFNMGRTY0RsYVFqbDZkak5OV0VGQ05uYxAB",
      author_name: "Angela",
      author_image:
        "https://lh3.googleusercontent.com/a-/ALV-UjVXUFY0u0cm8QONOQncJVhjgItcQzv3eIy_fYQ6YRVpaOZKK272=s120-c-rp-mo-ba2-br100",
      datetime: new Date("2025-07-26T10:48:24.668Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT214QmJEbDFNMGRTY0RsYVFqbDZkak5OV0VGQ05uYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOmxBbDl1M0dScDlaQjl6djNNWEFCNnc%7C0cW6csbqKJn%7C?hl=en",
      rating: 3,
      comments:
        "Ong! Can I say more about how cute this arcade is!! Definitely a must visit for any little girl or anyone who wants to be surrounded by cutesy and win stuffies! The only reason I only give this location a 3/5 stars is that the experience of winning really depends on who's working. We've been times where staff will help us win, give us free tokens to play until we've won and have walked out with lots and other times where the staff haven't helped or even spoken to us and have left with very little.",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT25GUVJUSXRNak5TTmpadVh6VlpaREJSWDBWUVpFRRAB",
      author_name: "Andy Madison",
      author_image:
        "https://lh3.googleusercontent.com/a/ACg8ocLSx2YixBHEYbTTQnMHD3RtPFKmXcqIlLoYkClqn6963Cm95g=s120-c-rp-mo-br100",
      datetime: new Date("2025-07-25T22:32:57.321Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT25GUVJUSXRNak5TTmpadVh6VlpaREJSWDBWUVpFRRAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOnFQRTItMjNSNjZuXzVZZDBRX0VQZEE%7C0cVwrOI7iZE%7C?hl=en",
      rating: 5,
      comments:
        "First time there with my son. The workers are so nice. The young lady who works there used her coins to help my son win a prize. I love that the claw machines are good quality that don't drop your prizes and I love that there prizes are catered to little boys as well! Most other places usually only carry girl toys. My son loved winning the Pokémon cards. My little boy left very happy.",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT214NmVsQk1PRmgwVUZsVlNFUTVjRVZSVVRsWVEzYxAB",
      author_name: "Justin Chhay",
      author_image:
        "https://lh3.googleusercontent.com/a-/ALV-UjWEez3amUp9q8OfjsRZwxXfKDJY9hQCp2kQlto4zY2halcvtdmTng=s120-c-rp-mo-br100",
      datetime: new Date("2025-07-20T09:09:03.672Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT214NmVsQk1PRmgwVUZsVlNFUTVjRVZSVVRsWVEzYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOmx6elBMOFh0UFlVSEQ5cEVRUTlYQ3c%7C0cU6bjc3liG%7C?hl=en",
      rating: 5,
      comments: null,
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2xGTmRraE1SMGt5T0dRMGNpMWFZMmRDTVZkWVozYxAB",
      author_name: "J A",
      author_image:
        "https://lh3.googleusercontent.com/a/ACg8ocKcDgJNGToJX3PJHkIbWkHvXe7TIky4hZXyCNYjYsV-s-xsnQ=s120-c-rp-mo-ba3-br100",
      datetime: new Date("2025-07-16T07:05:16.295Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xGTmRraE1SMGt5T0dRMGNpMWFZMmRDTVZkWVozYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOlFNdkhMR0kyOGQ0ci1aY2dCMVdYZ3c%7C0cSlQgGaIoZ%7C?hl=en",
      rating: 5,
      comments:
        "Found out about this place from my sister who took me there as an impromptu trip as we were nearby, and I have to say I was so impressed! This place is amazing, and the staff were so friendly. The guy working there was helpful and gave us some pointers to help us out! Him and the girl working there seemed like genuinely kind people, which just added to the happy atmosphere! We will totally be back 😊",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2pKWU9VWk9PVEJ2U2xKclVFcDBPVFF5VjBodlNuYxAB",
      author_name: "Luca",
      author_image:
        "https://lh3.googleusercontent.com/a-/ALV-UjX9exJYo6fqloM5Vhs-JCEUFbmfTSE4_byi7e-lKg-GI-xDWHA=s120-c-rp-mo-br100",
      datetime: new Date("2025-07-14T23:16:35.348Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2pKWU9VWk9PVEJ2U2xKclVFcDBPVFF5VjBodlNuYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOjJYOUZOOTBvSlJrUEp0OTQyV0hvSnc%7C0cSKTIJkJAS%7C?hl=en",
      rating: 5,
      comments: "Amazing staff!!!",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT25OZldYQTBVVEZNZVV3eWQwTmpRelJMWlVJMmVFRRAB",
      author_name: "Samuel C.",
      author_image:
        "https://lh3.googleusercontent.com/a-/ALV-UjXmmN6zXFlZgQst726G5VFhtO53vPQfuQVq3nYv0ngiKxAnISlB=s120-c-rp-mo-ba4-br100",
      datetime: new Date("2025-07-12T22:39:19.355Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT25OZldYQTBVVEZNZVV3eWQwTmpRelJMWlVJMmVFRRAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOnNfWXA0UTFMeUwyd0NjQzRLZUI2eEE%7C0cRejMKBLfJ%7C?hl=en",
      rating: 5,
      comments:
        "Wife saw the giant pig and forced us to go in and win the prize. The staff on site were very kind and helped us win the giant pig (it took 40 mini plushies to exchange for it) by showing us how to win, and re arranging plushies in each machine so it would be easier for us to win.\n\nFor us the staff is what makes this place special so if my wife sees another pig…. I guess we're going back in for round 2",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2w5UGJETkpiR05EYlRkQmIwTnRiRXhyVlVSUFVXYxAB",
      author_name: "Beckie Richards",
      author_image:
        "https://lh3.googleusercontent.com/a/ACg8ocLioHNPMT3JUe8FYl5iRLQWRUEqH6zzfR1lHvDcPZHULIVA=s120-c-rp-mo-br100",
      datetime: new Date("2025-07-08T23:27:03.153Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2w5UGJETkpiR05EYlRkQmIwTnRiRXhyVlVSUFVXYxAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOl9PbDNJbGNDbTdBb0NtbExrVURPUWc%7C0cQM3689QSj%7C?hl=en",
      rating: 5,
      comments:
        "I've been to a lot of claw machine places with my son from Toronto to Hamilton and this by far is one of the best I've ever been too! Staff are so friendly!",
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2tkSFRGVldlSE10ZFZNeVpHdHpaMGx3UW14dldWRRAB",
      author_name: "Kareem Saleh",
      author_image:
        "https://lh3.googleusercontent.com/a-/ALV-UjXKYfb6PAc-WXQ_uyF07_zCPczeOg-OBIeSWVR3UEuPUK1IdhO2=s120-c-rp-mo-ba2-br100",
      datetime: new Date("2025-07-01T22:59:07.327Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2tkSFRGVldlSE10ZFZNeVpHdHpaMGx3UW14dldWRRAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOkdHTFVWeHMtdVMyZGtzZ0lwQmxvWVE%7C0cO1zvIVaCe%7C?hl=en",
      rating: 5,
      comments: null,
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
    {
      business_id: businessId,
      lookup_id:
        "Ci9DQUlRQUNvZENodHljRjlvT2pCbmQxSktWMTgxV1hKR1dYRkdkRWhRYWt0Mk5GRRAB",
      author_name: "Joanne Moniz",
      author_image:
        "https://lh3.googleusercontent.com/a/ACg8ocIJwqnAiaLVscJKRtE6KY2xp7t8u7QqSlSOSvIs-ZX2aRQOuQ=s120-c-rp-mo-br100",
      datetime: new Date("2025-06-29T23:14:35.298Z"),
      link: "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2pCbmQxSktWMTgxV1hKR1dYRkdkRWhRYWt0Mk5GRRAB!2m1!1s0x0:0x1831b1fba51a8e9b!3m1!1s2@1:CAIQACodChtycF9oOjBnd1JKV181WXJGWXFGdEhQakt2NFE%7C0cNO1QGn5In%7C?hl=en",
      rating: 5,
      comments: null,
      created_at: new Date("2025-07-27T04:22:09.483Z"),
    },
  ]);

  console.log("Reviews seeded successfully");
}
