const INTERESTS = [
"Historical Fiction","World History","Ancient Civilisations","Indian History","Mythology","Greek Mythology","Norse Mythology","Indian Mythology","Historical Nonfiction","Biographies","Autobiographies","Memoirs","Political Leaders","Scientists","Artists & Musicians","Entrepreneurs","Sports Personalities","Royal Families","Women Who Changed History","Inspirational Lives",
"Science","Physics","Chemistry","Biology","Astronomy","Space Exploration","Mathematics","Technology","Artificial Intelligence","Computer Science","Robotics","Environment","Climate Change","Nature","Animals","Medical Science","Neuroscience","Psychology","Social Psychology","Human Behaviour","Self-Help","Personal Growth","Productivity","Mindfulness","Philosophy","Ethics","Logic","Spirituality","Religion & Culture",
"Fantasy","Epic Fantasy","Dark Fantasy","Science Fiction","Dystopian Fiction","Utopian Fiction","Adventure","Action","Mystery","Detective Stories","Crime","True Crime","Thriller","Psychological Thriller","Suspense","Horror","Gothic Fiction","Paranormal","Supernatural","Romance","Contemporary Romance","Historical Romance","Romantic Comedy","Young Adult","Coming of Age","Children's Literature","Middle Grade","Fairy Tales","Fables","Short Stories","Classic Literature","Modern Classics","Literary Fiction","Contemporary Fiction","Women's Fiction","Family Saga","Drama","Satire","Humour","LGBTQ+ Fiction",
"Graphic Novels","Comics","Manga","Anime & Manga","Webtoons","Illustrated Books","Poetry","Modern Poetry","Shayari","Plays & Drama","Screenwriting","Art & Design","Photography","Architecture","Fashion","Music","Cinema","Pop Culture","Food & Cooking","Baking","Travel","Travel Memoirs","Adventure Travel","Indian Travel","Geography","Cultures Around the World","Languages","Linguistics","Education","Study Skills","Career & Business","Finance","Economics","Marketing","Leadership","Management","Law","Criminology","Sociology","Politics","International Relations","Journalism","Current Affairs","Sports","Fitness","Yoga","Gardening","DIY & Crafts","Parenting","Relationships","Mental Wellness","Memoir & Essays","Military History","War Stories","Ocean & Marine Life","Astronomy & Space","Startups","Personal Finance","Communication Skills","Mystery Classics","Detective Fiction","Folklore","Legends","Magical Realism","Climate Fiction","Cybersecurity","Data Science","Programming","Engineering","Public Speaking","Human Rights","Gender Studies","Rural Life","Urban Life","Indian Literature","African Literature","Japanese Literature","Korean Literature","Latin American Literature","Russian Literature","French Literature","English Literature"
];

const SUBJECT_MAP = {
"Historical Fiction":"historical_fiction","World History":"history","Ancient Civilisations":"ancient_civilizations","Indian History":"india_history","Mythology":"mythology","Greek Mythology":"greek_mythology","Norse Mythology":"norse_mythology","Indian Mythology":"hindu_mythology","Historical Nonfiction":"history","Biographies":"biography","Autobiographies":"autobiography","Memoirs":"memoir","Political Leaders":"political_science","Scientists":"scientists","Artists & Musicians":"artists","Entrepreneurs":"entrepreneurship","Science":"science","Physics":"physics","Chemistry":"chemistry","Biology":"biology","Astronomy":"astronomy","Space Exploration":"space","Mathematics":"mathematics","Technology":"technology","Artificial Intelligence":"artificial_intelligence","Computer Science":"computer_science","Robotics":"robotics","Environment":"environment","Climate Change":"climate_change","Nature":"nature","Animals":"animals","Medical Science":"medicine","Neuroscience":"neuroscience","Psychology":"psychology","Social Psychology":"social_psychology","Human Behaviour":"human_behavior","Self-Help":"self_help","Personal Growth":"personal_development","Productivity":"productivity","Mindfulness":"mindfulness","Philosophy":"philosophy","Ethics":"ethics","Fantasy":"fantasy","Epic Fantasy":"epic_fantasy","Science Fiction":"science_fiction","Dystopian Fiction":"dystopian","Adventure":"adventure","Action":"action","Mystery":"mystery","Detective Stories":"detective","Crime":"crime","True Crime":"true_crime","Thriller":"thriller","Psychological Thriller":"psychological_thriller","Horror":"horror","Romance":"romance","Contemporary Romance":"contemporary_romance","Romantic Comedy":"romantic_comedy","Young Adult":"young_adult","Coming of Age":"coming_of_age","Children's Literature":"juvenile_fiction","Classic Literature":"classics","Literary Fiction":"literary_fiction","Contemporary Fiction":"fiction","Graphic Novels":"graphic_novels","Comics":"comics","Manga":"manga","Poetry":"poetry","Art & Design":"art","Photography":"photography","Architecture":"architecture","Fashion":"fashion","Music":"music","Cinema":"film","Food & Cooking":"cooking","Travel":"travel","Travel Memoirs":"travel_writing","Geography":"geography","Cultures Around the World":"social_science","Education":"education","Career & Business":"business","Finance":"finance","Economics":"economics","Marketing":"marketing","Leadership":"leadership","Law":"law","Criminology":"criminology","Sociology":"sociology","Politics":"politics","Sports":"sports","Fitness":"health_fitness","Yoga":"yoga","Gardening":"gardening","Parenting":"parenting","Relationships":"relationships","Military History":"military_history","Folklore":"folklore","Legends":"legends","Programming":"programming","Engineering":"engineering","Indian Literature":"india"
};

const $ = id => document.getElementById(id);
let allBooks = [], chosenInterests = [], activeBooks = [], searchTimer;
const interestGrid = $("interestGrid");

INTERESTS.forEach((interest, index) => {
  const label = document.createElement("label");
  label.className = "interest-option";
  label.innerHTML = `<input type="checkbox" value="${escapeHtml(interest)}"><span>${escapeHtml(interest)}</span>`;
  interestGrid.appendChild(label);
});
interestGrid.addEventListener("change", () => {
  const count = interestGrid.querySelectorAll("input:checked").length;
  $("selectedCount").textContent = `${count} interest${count===1?"":"s"} selected`;
});

$("startBtn").addEventListener("click", () => $("quizSection").scrollIntoView({behavior:"smooth"}));
$("editChoices").addEventListener("click", () => $("quizSection").scrollIntoView({behavior:"smooth"}));
$("preferenceForm").addEventListener("submit", async e => {
  e.preventDefault();
  chosenInterests = [...interestGrid.querySelectorAll("input:checked")].map(x=>x.value);
  if (!chosenInterests.length) { toast("Please select at least one interest first."); return; }
  await loadRecommendations();
});
$("searchInput").addEventListener("input", renderShelves);
$("sortSelect").addEventListener("change", renderShelves);
$("closeModal").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if(e.key==="Escape") closeModal(); });

async function loadRecommendations() {
  $("loading").classList.remove("hidden");
  $("shelves").innerHTML = "";
  $("resultsMessage").textContent = "Searching the Open Library catalogue for your interests…";
  $("discover").scrollIntoView({behavior:"smooth"});
  const subjects = [...new Set(chosenInterests.map(x=>SUBJECT_MAP[x] || slug(x)))].slice(0,12);
  try {
    const responses = await Promise.all(subjects.map(async subject => {
      const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=100`;
      const response = await fetch(url);
      if(!response.ok) return [];
      const data = await response.json();
      return (data.works || []).map(book => normalizeBook(book, subject));
    }));
    const map = new Map();
    responses.flat().forEach(book => {
      const key = book.key || `${book.title}-${book.author}`;
      if(!map.has(key)) map.set(key, book);
      else map.get(key).match += 1;
    });
    allBooks = [...map.values()].filter(b=>b.title);
    if (!allBooks.length) throw new Error("No results");
    // Favour titles that appear in multiple selected subject shelves.
    allBooks.sort((a,b)=>b.match-a.match);
    activeBooks = allBooks;
    $("resultsMessage").textContent = `Found ${allBooks.length.toLocaleString()} catalogue matches across ${chosenInterests.length} selected interests.`;
    renderShelves();
  } catch(error) {
    $("shelves").innerHTML = `<div class="empty-state"><h3>We couldn't reach the book catalogue</h3><p>Please check your internet connection and try again. Open Library is a free public catalogue service.</p><button class="red-btn" onclick="loadRecommendations()">TRY AGAIN</button></div>`;
    $("resultsMessage").textContent = "Catalogue connection unavailable.";
  } finally { $("loading").classList.add("hidden"); }
}

function normalizeBook(book, subject) {
  const cover = book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg` : "";
  return {key:book.key,title:book.title || "Untitled",author:(book.authors||[]).map(a=>a.name).join(", ") || "Author not listed",
    year:book.first_publish_year || "",cover,subjects:book.subject || [subject],match:1,editionCount:book.edition_count||0};
}
function renderShelves() {
  if(!allBooks.length) return;
  const q=$("searchInput").value.trim().toLowerCase(), sort=$("sortSelect").value;
  let books=allBooks.filter(b=>`${b.title} ${b.author} ${(b.subjects||[]).join(" ")}`.toLowerCase().includes(q));
  if(sort==="title") books.sort((a,b)=>a.title.localeCompare(b.title));
  if(sort==="year") books.sort((a,b)=>(b.year||0)-(a.year||0));
  else if(sort==="match") books.sort((a,b)=>b.match-a.match);
  if(!books.length){$("shelves").innerHTML='<div class="empty-state"><h3>No books found</h3><p>Try another search term.</p></div>';return;}
  const groups = [
    {name:"Top picks for you",items:books.slice(0,18)},
    {name:"More from your selected interests",items:books.slice(18,42)},
    {name:"Keep exploring",items:books.slice(42,72)}
  ].filter(g=>g.items.length);
  $("shelves").innerHTML=groups.map((group,i)=>`<section class="shelf"><h3>${group.name}<small>${group.items.length} titles</small></h3><div class="book-row">${group.items.map(bookCard).join("")}</div></section>`).join("");
  $("shelves").querySelectorAll(".book-card").forEach(card=>card.addEventListener("click",()=>showBook(card.dataset.key)));
}
function bookCard(book) {
  const cover=book.cover?`<img loading="lazy" src="${book.cover}" alt="Cover of ${escapeHtml(book.title)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:"";
  return `<article class="book-card" data-key="${escapeHtml(book.key||"")}"><div class="cover-wrap">${cover}<div class="cover-fallback" style="${book.cover?"display:none":""}">${escapeHtml(book.title)}</div><span class="match-tag">${book.match>1?"POPULAR MATCH":"YOUR PICK"}</span></div><h4>${escapeHtml(book.title)}</h4><p>${escapeHtml(book.author)}${book.year?" · "+book.year:""}</p></article>`;
}
async function showBook(key) {
  const book=allBooks.find(b=>b.key===key); if(!book)return;
  $("modalContent").innerHTML=`<div class="modal-layout"><div>${book.cover?`<img class="modal-cover" src="${book.cover}" alt="Book cover">`:"<div class='cover-fallback modal-cover'>"+escapeHtml(book.title)+"</div>"}</div><div class="modal-info"><p class="eyebrow">BOOK DETAILS</p><h2 id="modalTitle">${escapeHtml(book.title)}</h2><div class="modal-meta">By ${escapeHtml(book.author)}<br>${book.year?`First published: ${book.year}<br>`:""}${book.editionCount?`${book.editionCount} editions listed<br>`:""}Categories: ${escapeHtml((book.subjects||[]).slice(0,5).join(", "))}</div><p class="modal-description" id="description">Loading book description…</p><a class="modal-link" id="openLibraryLink" href="https://openlibrary.org${book.key}" target="_blank" rel="noopener">VIEW ON OPEN LIBRARY ↗</a></div></div>`;
  $("bookModal").classList.remove("hidden");
  try {
    const res=await fetch(`https://openlibrary.org${book.key}.json`);
    const data=await res.json();
    let desc=data.description;
    if(typeof desc==="object" && desc) desc=desc.value;
    $("description").textContent=desc || "A full description is not available in the catalogue for this title. Open the library record to explore editions, subjects and other details.";
  } catch { $("description").textContent="Description could not be loaded. You can still open the library record for more details."; }
}
function closeModal(){$("bookModal").classList.add("hidden");}
function slug(s){return s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);}
