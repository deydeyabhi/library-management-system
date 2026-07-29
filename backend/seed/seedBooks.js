// Seed the catalog with 20 real-world books.
// Idempotent: books already present (matched by ISBN) are skipped, so this
// is safe to run more than once.
//   Run from the backend/ folder:  node seed/seedBooks.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Book = require('../models/Book');

dotenv.config();

const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// availableCopies is deliberately varied (some copies "checked out") so the
// catalog looks lived-in, including one title that is fully out of stock.
const books = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    genre: 'Classic Fiction',
    description:
      'In the Depression-era South, young Scout Finch watches her lawyer father defend a Black man falsely accused of a crime, learning hard lessons about justice, prejudice, and moral courage.',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    genre: 'Dystopian',
    description:
      'In a totalitarian superstate ruled by Big Brother, low-ranking party member Winston Smith risks everything to think freely and love honestly under the ever-watchful eye of the Party.',
    totalCopies: 8,
    availableCopies: 5,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    genre: 'Classic Fiction',
    description:
      'Narrator Nick Carraway is drawn into the glittering, hollow world of the mysterious millionaire Jay Gatsby and his doomed obsession with the beautiful Daisy Buchanan.',
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    genre: 'Romance',
    description:
      'Spirited Elizabeth Bennet spars with the proud Mr. Darcy in Regency England, as first impressions give way to a slow, hard-won understanding of love and character.',
    totalCopies: 4,
    availableCopies: 2,
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '9780316769488',
    genre: 'Coming-of-Age',
    description:
      'Over a few restless days in New York City, disillusioned teenager Holden Caulfield rails against a world he finds phony while quietly longing for connection and innocence.',
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780547928227',
    genre: 'Fantasy',
    description:
      'The comfort-loving hobbit Bilbo Baggins is swept into an adventure with thirteen dwarves and the wizard Gandalf to reclaim a treasure guarded by the dragon Smaug.',
    totalCopies: 7,
    availableCopies: 6,
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: 'J.K. Rowling',
    isbn: '9780590353427',
    genre: 'Fantasy',
    description:
      'On his eleventh birthday, orphan Harry Potter learns he is a wizard and begins his first year at Hogwarts, uncovering the truth about his past and a stone that grants eternal life.',
    totalCopies: 10,
    availableCopies: 0,
  },
  {
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '9780544003415',
    genre: 'Fantasy',
    description:
      'Frodo Baggins inherits a ring of terrible power and undertakes a perilous quest across Middle-earth to destroy it before the Dark Lord Sauron can reclaim it.',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '9780060850524',
    genre: 'Dystopian',
    description:
      'In a future engineered for stability and pleasure, citizens are bred to order and pacified by a drug called soma, until an outsider forces the World State to confront what it has lost.',
    totalCopies: 4,
    availableCopies: 3,
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780061122415',
    genre: 'Fiction',
    description:
      'A young Andalusian shepherd named Santiago journeys from Spain to the Egyptian desert in search of a treasure, discovering that the real reward is following his own Personal Legend.',
    totalCopies: 9,
    availableCopies: 7,
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    genre: 'History',
    description:
      'A sweeping account of how Homo sapiens came to dominate the planet, tracing the cognitive, agricultural, and scientific revolutions that shaped human society.',
    totalCopies: 6,
    availableCopies: 2,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    genre: 'Self-Help',
    description:
      'A practical framework for building good habits and breaking bad ones, showing how tiny, consistent changes compound into remarkable results over time.',
    totalCopies: 8,
    availableCopies: 3,
  },
  {
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    isbn: '9780307474278',
    genre: 'Mystery Thriller',
    description:
      'Symbologist Robert Langdon races through Paris and London to solve a murder at the Louvre, unraveling a centuries-old secret hidden in famous works of art.',
    totalCopies: 5,
    availableCopies: 5,
  },
  {
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    isbn: '9780307949486',
    genre: 'Crime Thriller',
    description:
      'Disgraced journalist Mikael Blomkvist teams up with brilliant, troubled hacker Lisbeth Salander to investigate a wealthy family and a woman who vanished decades ago.',
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '9780553380163',
    genre: 'Science',
    description:
      'A landmark of popular science that explains black holes, the Big Bang, and the nature of time in language accessible to readers without a physics background.',
    totalCopies: 3,
    availableCopies: 2,
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '9780374533557',
    genre: 'Psychology',
    description:
      'Nobel laureate Daniel Kahneman explores the two systems that drive the way we think—fast and intuitive versus slow and deliberate—and the biases that shape our judgments.',
    totalCopies: 5,
    availableCopies: 4,
  },
  {
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    isbn: '9781594631931',
    genre: 'Fiction',
    description:
      'Set against the backdrop of a changing Afghanistan, this is the story of Amir and his childhood friend Hassan, and the long road toward redemption for a betrayal that haunts him.',
    totalCopies: 5,
    availableCopies: 3,
  },
  {
    title: 'The Book Thief',
    author: 'Markus Zusak',
    isbn: '9780375842207',
    genre: 'Historical Fiction',
    description:
      'Narrated by Death, this novel follows Liesel Meminger, a young girl in Nazi Germany who steals books and shares them, finding hope amid the horrors of war.',
    totalCopies: 4,
    availableCopies: 4,
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '9780399590504',
    genre: 'Memoir',
    description:
      'A memoir of a young woman raised in a survivalist family in the mountains of Idaho who leaves home to educate herself, eventually earning a PhD from Cambridge.',
    totalCopies: 6,
    availableCopies: 5,
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    genre: 'Science Fiction',
    description:
      'On the desert planet Arrakis, young Paul Atreides becomes embroiled in a struggle for control of the universe\'s most valuable substance, the spice melange.',
    totalCopies: 7,
    availableCopies: 1,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected. Seeding ${books.length} books...`);

  let inserted = 0;
  let skipped = 0;
  for (const b of books) {
    const exists = await Book.findOne({ isbn: b.isbn });
    if (exists) {
      skipped++;
      console.log(`  skip  ${b.title} (ISBN already exists)`);
      continue;
    }
    await Book.create({ ...b, coverImage: cover(b.isbn) });
    inserted++;
    console.log(`  add   ${b.title}`);
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}. Total in catalog: ${await Book.countDocuments()}`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
