# organiZapp V 2.0

---

## About the Project

Hey everyone! Excited to share my latest project, **OrganiZapp**, an information management application designed to streamline communication and organization within teams, groups, or even with friends. In today's fast-paced world, staying connected and coordinated can be a real challenge. I created OrganiZapp to simplify just that!

OrganiZapp offers an intuitive platform where you can:

* **Create and participate in group chats** for seamless, real-time communication.
* **Manage a personal calendar** to organize important events, meetings, and activities with your group.

My goal was to provide a practical solution for any group to communicate effectively and centralize their activities. It's been an incredible journey of learning and development, and I'm super proud of the result. I invite you to explore it and give me your feedback!

---

## Technical Stack

OrganiZapp is built with **Next.js (React)** and utilizes a robust backend powered by **Node.js**.

* **Backend**: Node.js (PostgreSQL for the database)
* **Frontend**: Next.js (React)

### Key Libraries Used:

* **Backend**: `PRISMA`, `JWT`, `JOI`, `BCRYPT`, `DOTENV`, `EXPRESSJWT`, `CORS`, `ESLINT`
* **Frontend**: `DOTENV`, `TAILWINDCSS`, `AUTOPREFIXER`, `ESLINT`, `NEXTAUTH`, `REACTDOM`, `SHARP`, `NODEMAILLER`

---

## Installation and Setup

Getting OrganiZapp up and running is straightforward. Follow these steps:
1.  **Environment Variables**: You'll need to fill in the required environment variables in the `.env` files for both the backend and frontend. Look for `.env.example` files in their respective directories for guidance.
2.  **Prisma Setup**: Navigate to the `apps/backend` directory and run `npx primsa generate`. This will install the database, but you need first the enviroment variables in backend.
3.  **Backend Installation**: Navigate to the `apps/backend` directory and run `npm install`. This will install all backend dependencies, including Prisma.
4.  **Frontend Installation**: Go to the `apps/frontend` directory and run `npm install`. This will install all frontend dependencies.
5.  **General Installation**: From the root directory of the project, run `npm install`. This ensures all necessary packages are installed across the entire project.
6.  **Start the Application**: Once all installations are complete and your environment variables are set, run `npm run dev` from the root directory to start the application.

---

## Project Member

* Diego Lopez
