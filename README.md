# BookFlix – Library Book Recommendation System

A beginner-friendly front-end mini project built with **HTML, CSS and JavaScript**. It asks readers about their interests, searches book subjects, and displays book recommendations in a streaming-platform-inspired interface.

## Features
- 150+ selectable interests across fiction, nonfiction, science, biography, history, crime, romance, psychology, travel, philosophy, graphic novels, and more.
- Multiple-choice preferences: reading mood, length, reading level and language.
- Recommendation shelves, search and sorting.
- Book detail popup with author, first publication year, subjects, description and a link to the Open Library record.
- Responsive dark interface with a red accent theme.
- Retrieves real catalogue records from the free Open Library public API.

## Important note about the 1,000+ book requirement
The project queries Open Library subject catalogues (up to 100 records per selected subject, across up to 12 selected subjects) and combines duplicate records. This allows it to discover a catalogue of 1,000+ titles when enough results are available. The exact number depends on selected interests and Open Library's current catalogue/API response; it does not pretend that generated sample titles are real books.

## Run in VS Code
1. Install **Visual Studio Code**.
2. Download and unzip `BookFlix-Library-Recommender.zip`.
3. In VS Code choose **File → Open Folder** and select the unzipped `BookFlix-Library-Recommender` folder.
4. Install the VS Code extension **Live Server** (by Ritwick Dey).
5. Open `index.html`, right-click inside it and choose **Open with Live Server**.
6. Your browser should open the website. Keep an internet connection on because book records, descriptions, covers and the Google font load online.

You can also open `index.html` directly in a browser, but Live Server is recommended.

## Upload to GitHub
1. Create or sign in to your GitHub account.
2. Click **New repository**. Name it `BookFlix-Library-Recommender`.
3. Set it to Public or Private as your teacher requests. Add a short description and create the repository.
4. In the repository page choose **Add file → Upload files**.
5. Upload `index.html`, `style.css`, `script.js` and `README.md` (or upload the project folder contents).
6. Click **Commit changes**.
7. To publish it as a website: open **Settings → Pages**, under Build and deployment select **Deploy from a branch**, choose `main` and `/ (root)`, then Save. Wait a minute and refresh. GitHub will show your website URL.

## Project structure
```text
BookFlix-Library-Recommender/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How recommendations work
1. The user selects one or more interests.
2. JavaScript maps those choices to Open Library subject identifiers.
3. The app fetches up to 100 works for each of up to 12 selected subjects.
4. It removes duplicate records and prioritises books that appear in multiple selected subject results.
5. Clicking a book fetches its work record to display a description where available.

## Limitations / future improvements
- Requires internet access and Open Library availability.
- The recommendation score is a simple subject-overlap ranking, not a trained AI model.
- Some books may not have a cover, description, year or author listed.
- For a larger final-year version, add user accounts, saved favourites, borrowing availability from your college library database, and a machine-learning recommendation model.

## Viva / teacher explanation
**What is the project?** A web-based book recommendation system that suggests books based on a reader's selected interests.

**Which technologies are used?** HTML for structure, CSS for styling and responsive layout, JavaScript for form handling, API requests, filtering and book details.

**What is an API?** An API allows one software application to request data from another service. This project uses the Open Library API to retrieve book information.

**Is it AI?** The current version uses rule-based subject matching, not machine learning. It is a recommendation system prototype. A future version could learn from ratings and reading history.

**Why are some descriptions missing?** Open Library is a community-maintained catalogue, and not every record has complete metadata.
