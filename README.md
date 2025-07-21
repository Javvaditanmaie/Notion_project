# Real time Collaborative Notion 
A real-time Notion-style editor with role-based access, live cursors, comments, and Firebase Auth. Built with React, TipTap, Yjs, WebRTC/WebSocket, and Firestore.

## Tech stack
- **Frontend**: React, TipTap, TailwindCSS, Socket.io
- **Collaboration**: Yjs, y-websocket / y-webrtc, yjs awareness
- **Backend**: Express.js, Firebase Admin SDK, Firestore, JWT
- **Authentication**: Firebase Auth
- **Realtime Presence**: Socket.io, y-webrtc awareness
- **Persistence**: Firestore
 ---
 ## **2. API Documentation (Swagger)**
 Visit `http://localhost:5000/api-docs` after running backend.
 ### Auth Flow

1. **Login with Firebase Auth**
2. **Use Firebase ID Token to exchange JWT:**
   POST `/api/token` → returns JWT
3. **Use JWT for all protected routes:**
   Authorization: Bearer <JWT>
### Endpoints Summary
#### POST  `/api/token`  
 Auth Required
 Firebase ID
 Description 
 Exchange Firebase token for JWT 
 <img width="1919" height="1010" alt="Screenshot 2025-07-21 005856" src="https://github.com/user-attachments/assets/2f271d2e-5c1b-4f1a-a940-7b47073c704b" />
#### GET    | `/api/docs
JWT
Get users-owend document
<img width="1911" height="977" alt="Screenshot 2025-07-21 010007" src="https://github.com/user-attachments/assets/ffa60252-a6e7-4d6c-9122-b1ed18b63b69" />
#### POST   | `/api/docs` 
JWT
Create a new document   
<img width="1919" height="1079" alt="Screenshot 2025-07-21 010113" src="https://github.com/user-attachments/assets/6ba8aa58-1361-4e56-8ba1-97c368458931" />
#### GET    | `/api/docs/:id`
JWT
Get document by ID
<img width="1909" height="1007" alt="Screenshot 2025-07-21 010546" src="https://github.com/user-attachments/assets/1b289152-85ee-4579-8846-c753736e400f" />
#### PUT    | `/api/docs/:id`          
JWT         
Update document    
<img width="1909" height="1007" alt="Screenshot 2025-07-21 010546" src="https://github.com/user-attachments/assets/fdfd246a-b0cf-4910-9b24-1c86054b9abb" />
#### | DELETE | `/api/docs/:id`         
JWT           
Delete document
<img width="1879" height="968" alt="Screenshot 2025-07-21 010613" src="https://github.com/user-attachments/assets/84168e5a-a6d9-42a7-9c08-6e69a4537f08" />
####  PUT    | `/api/docs/:id/favorite` 
JWT           
Toggle favorite status     

## Architecture Documentation
###  database schema
<pre>
documents = users=>{
access:"edit"(string)
content:"<p>hello this is tan<em>maie yell are u so deu</em></p>"(string)
createdAt:July 19, 2025 at 2:01:44 PM UTC+5:30(timestamp)
favorite:false(boolean)
owner:"QUsKDc9dD6NmbvvO8njWRlabjOt2"(string)
title:"hi"
}
</pre>
## Deployment Guide (how to deploy the application)
git clone https://github.com/Javvaditanmaie/Notion_project.git
#### how to run backend locally
#### Installation 
- npm init -y
- npm install express etc
- cd backend
- node index.js
- now you see server is running on http://localhost:5000
##### Frontend
##### Installation
React+vite
npm create vite@latest my-app
cd my-app
npm install
npm run dev

cd frontend
cd my-app
npm run dev
you will see
VITE v7.0.4  ready in 856 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
#### how to run webrtcs
run-> git clone https://github.com/yjs/y-webrtc.git
cd y-webrtc
npm install
npm start
## system design
<img width="940" height="785" alt="image" src="https://github.com/user-attachments/assets/39c7848a-9d54-425e-afcc-5956577d048b" />
