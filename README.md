                                                              Sports Website – Loading Live Info from API

🎯 A sports website built with Node.js, Express, EJS, Bootstrap, and MongoDB that fetches and displays live match information from a football API.
Users can view live scores, match details, and odds, with an attractive and responsive interface.

📸 Demo
<img width="1342" height="637" alt="leagues" src="https://github.com/user-attachments/assets/a99a0090-45a8-4790-8d60-d46b1499e173" />
<img width="1345" height="641" alt="profile" src="https://github.com/user-attachments/assets/dfc13c2a-dbf8-4329-ae58-a2ccad9a739b" />
<img width="1360" height="494" alt="root" src="https://github.com/user-attachments/assets/b141446d-0513-4541-9385-532ff23cbf7a" />
<img width="1349" height="645" alt="matchInfo" src="https://github.com/user-attachments/assets/a7e433ed-9ca8-4bbc-9071-6802c7526dd5" />
<img width="553" height="453" alt="Login" src="https://github.com/user-attachments/assets/0886d7f3-e641-4729-ab99-579b033d639c" />
<img width="539" height="598" alt="register" src="https://github.com/user-attachments/assets/9f740e77-6c09-4023-b7b1-c3d83152938a" />

🚀 Features:

⚽ Live football matches with scores, elapsed time, and status (e.g., First Half, Half Time, etc.)
⏱️ Blinking live timer when the match is ongoing.
📝 Odds button for more info (placeholder for future feature or link).
📄 Responsive design, mobile-friendly.
🎨 Clean and modern UI using Bootstrap 5.

🛠️ Tech Stack
Backend: Node.js, Express.js
Frontend: EJS templates, Bootstrap 5, Custom CSS
Database: MongoDB
API: Football API -> https://rapidapi.com/api-sports/api/api-football/playground/apiendpoint_86f36daf-2469-4ae1-a552-622fe68c2460
Other: FontAwesome, Google Fonts

🔧 Steps to Setup & Run Locally

1️)Clone the repository:
git clone https://github.com/KristiyanHr/Sports-Website-loading-info-from-API-.git
cd Sports-Website-loading-info-from-API-

2)Install dependencies:
npm install

3️)Set up environment variables:
Create a .env file with your API key and MongoDB URI:

API_KEY=your_football_api_key
MONGO_URI=your_mongodb_connection_string
PORT=3000

4️) Run the app:
npm start

or with nodemon:
npx nodemon

5️)Open your browser at http://localhost:3000


