# BillBuddy - Shared Expense Tracker

BillBuddy is a full-stack MERN application designed to simplify tracking and splitting shared expenses among groups. It replaces inefficient manual methods by providing a clean, mobile-responsive platform to manage complex, multi-person transactions with transparency and persistence.

---

### Core Features

*   **Secure User Authentication**: Register and log in with a unique username/email and a securely hashed password.
*   **Event-Based Tracking**: Create private events (e.g., "Goa Trip", "Monthly Rent") with a dedicated currency (USD or INR).
*   **Flexible Expense Entry**: Add expenses with a "per-person cost" model, allowing for uneven splits within a single transaction.
*   **Transparent Debt Calculation**: The app calculates the direct, pair-wise net debt between members. There is no confusing simplification (e.g., A owes B, B owes C -> A owes C). It's always the direct debt.
*   **One-Click Debt Settlement**: The person who is owed money can mark a debt as paid with a single click, which updates the event's balance in real-time.
*   **Detailed Breakdowns**: View the specific cost breakdown for every transaction in a clean pop-up modal.

---

### Tech Stack

*   **Frontend**: React, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (with Mongoose)
*   **Authentication**: JSON Web Tokens (JWT)

---

### How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd billbuddy
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    ```
    *Create a `.env` file in the `/backend` directory and add your variables:*
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=a_very_long_and_secret_key
    ```
    *Start the backend server:*
    ```bash
    npm start
    ```

3.  **Setup Frontend:**
    *Open a new terminal window.*
    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.