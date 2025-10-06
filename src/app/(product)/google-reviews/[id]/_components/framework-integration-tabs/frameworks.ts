interface Framework {
  id: string;
  name: string;
  description: string;
  code: string;
}

export function getFrameworks(
  placeId: string | null,
  apiKey: string | null,
): Framework[] {
  const placeholderPlaceId = placeId || "YOUR_PLACE_ID";
  const placeholderApiKey = apiKey || "YOUR_API_KEY";

  return [
    {
      id: "nextjs",
      name: "Next.js",
      description:
        "For Next.js applications, fetch reviews during static generation using getStaticProps or in your build process.",
      code: `// pages/index.js or app/page.js
export async function getStaticProps() {
  const response = await fetch('https://bragfeed.dev/reviews/${placeholderPlaceId}', {
    headers: {
      'Authorization': 'Bearer ${placeholderApiKey}',
    }
  });
  
  const reviews = await response.json();
  
  return {
    props: {
      reviews,
    },
    revalidate: 24 * 60 * 60, // Revalidate every day
  };
}

export default function HomePage({ reviews }) {
  return (
    <div>
      <h1>Our Reviews</h1>
      {reviews.map(review => (
        <div key={review.id}>
          <h3>{review.author}</h3>
          <p>Rating: {review.rating}/5</p>
          <p>{review.text}</p>
        </div>
      ))}
    </div>
  );
}`,
    },
    {
      id: "gatsby",
      name: "Gatsby",
      description:
        "In Gatsby, use gatsby-node.js to fetch reviews at build time and make them available to your components.",
      code: `// gatsby-node.js
exports.sourceNodes = async ({ actions, createContentDigest }) => {
  const { createNode } = actions;
  
  const response = await fetch('https://bragfeed.dev/reviews/${placeholderPlaceId}', {
    headers: {
      'Authorization': 'Bearer ${placeholderApiKey}',
    }
  });
  
  const reviews = await response.json();
  
  reviews.forEach(review => {
    createNode({
      ...review,
      id: review.id,
      parent: null,
      children: [],
      internal: {
        type: 'GoogleReview',
        contentDigest: createContentDigest(review),
      },
    });
  });
};

// src/pages/reviews.js
import { graphql } from "gatsby";

export default function ReviewsPage({ data }) {
  const reviews = data.allGoogleReview.nodes;
  
  return (
    <div>
      <h1>Customer Reviews</h1>
      {reviews.map(review => (
        <div key={review.id}>
          <h3>{review.author}</h3>
          <p>Rating: {review.rating}/5</p>
          <p>{review.text}</p>
        </div>
      ))}
    </div>
  );
}

export const query = graphql\`
  query {
    allGoogleReview {
      nodes {
        id
        author
        rating
        text
        date
      }
    }
  }
\`;`,
    },
    {
      id: "eleventy",
      name: "11ty",
      description:
        "Use 11ty's _data directory to fetch reviews globally or create a custom data file that runs at build time.",
      code: `// _data/reviews.js
module.exports = async function() {
  const fetch = require('node-fetch');
  
  try {
    const response = await fetch('https://bragfeed.dev/reviews/${placeholderPlaceId}', {
      headers: {
        'Authorization': 'Bearer ${placeholderApiKey}',
      }
    });
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
};

<!-- reviews.njk -->
---
layout: base.njk
---

<h1>Customer Reviews</h1>
<div class="reviews">
  {% for review in reviews %}
    <div class="review">
      <h3>{{ review.author }}</h3>
      <p>Rating: {{ review.rating }}/5</p>
      <p>{{ review.text }}</p>
      <small>{{ review.date }}</small>
    </div>
  {% endfor %}
</div>`,
    },
    {
      id: "hugo",
      name: "Hugo",
      description:
        "For Hugo, you can fetch reviews using Hugo's data templates or external data sources.",
      code: `<!-- layouts/partials/reviews.html -->
{{ $reviews := getJSON "https://bragfeed.dev/reviews/${placeholderPlaceId}" }}

<section class="reviews">
  <h2>Customer Reviews</h2>
  {{ range $reviews }}
    <div class="review">
      <h3>{{ .author }}</h3>
      <div class="rating">
        {{ range (seq .rating) }}⭐{{ end }}
      </div>
      <p>{{ .text }}</p>
      <small>{{ dateFormat "January 2, 2006" .date }}</small>
    </div>
  {{ end }}
</section>

<!-- config.yaml -->
# Add your API key to config
params:
  reviews_api_key: "${placeholderApiKey}"
  
# Or use environment variables in your build process
# HUGO_PARAMS_REVIEWS_API_KEY=${placeholderApiKey} hugo`,
    },
    {
      id: "astro",
      name: "Astro",
      description:
        "In Astro, fetch reviews in the frontmatter of your pages or components for static generation.",
      code: `---
// src/pages/reviews.astro
const response = await fetch('https://bragfeed.dev/reviews/${placeholderPlaceId}', {
  headers: {
    'Authorization': 'Bearer ${placeholderApiKey}',
  }
});

const reviews = await response.json();
---

<html>
  <head>
    <title>Customer Reviews</title>
  </head>
  <body>
    <h1>What Our Customers Say</h1>
    <div class="reviews">
      {reviews.map(review => (
        <div class="review" key={review.id}>
          <h3>{review.author}</h3>
          <div class="rating">
            Rating: {review.rating}/5
          </div>
          <p>{review.text}</p>
          <small>{review.date}</small>
        </div>
      ))}
    </div>
  </body>
</html>

<style>
  .reviews {
    display: grid;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .review {
    border: 1px solid #e1e5e9;
    padding: 1rem;
    border-radius: 8px;
  }
</style>`,
    },
  ];
}
