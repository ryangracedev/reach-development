# **Reach Development**

### **About**
Reach is a web application designed to make event creation and management seamless. With Reach, users can:
- Create events as a host.
- Invite others to events and manage RSVPs.
- View upcoming and past events.
- Admins can monitor all events to ensure proper functionality.

Reach is ideal for planning personal gatherings, professional meetings, and social occasions while keeping everything organized in one place.

---

### **Features**
- **User Signup & Verification**:
  - Users can create accounts with a unique username, password, and phone number.
  - Phone numbers are verified through a verification code.

- **Event Creation**:
  - Users can create events with custom details, including name, description, date, time, and location.
  - Each event is associated with the user who created it (the host).

- **Event Invitations**:
  - Hosts can invite users to their events.
  - Invitees are linked to the event and notified about the invitation.

- **Admin Functionality**:
  - Admins can view all events (active or past) and ensure everything is functioning as intended.

---

### **Tech Stack**
- **Frontend**: React.js
  - User-friendly interface with step-by-step forms for creating events and signing up.
  - Dynamic validation to ensure smooth and error-free user experience.
  
- **Backend**: Flask
  - RESTful API for user and event management.
  - Robust validation and error handling to maintain data integrity.

- **Database**: MongoDB
  - NoSQL database for storing users and events.
  - Optimized for relationships between users and events through references.

- **Authentication**: Secure password hashing with `werkzeug.security`.

---

### **Database Structure**
Reach uses MongoDB to store and manage users and events. Here's an overview of the database structure:

#### **Users Collection**
The `users` collection stores details about the application's users, including the events they are hosting and attending.

```json
{
  "_id": "user_id_123",
  "username": "john_doe",
  "phone_number": "1234567890",
  "profile_picture": "link_to_profile_picture",
  "hosted_events": ["event_id_1", "event_id_3"], // Events the user is hosting
  "invited_events": ["event_id_2"] // Events the user is invited to
}
```

#### **Events Collection**
The `events` collection stores all event details and links to the host and invitees.

```json
{
  "_id": "event_id_1",
  "event_name": "Birthday Party",
  "description": "John's 30th birthday celebration",
  "address": "123 Party St",
  "date_time": "2024-12-01T18:00:00",
  "host_id": "user_id_123", // Reference to the host (user)
  "invitee_ids": ["user_id_124", "user_id_125"], // References to invited users
  "status": "active" // Can be 'active', 'completed', or 'cancelled'
}
```

---

### **API Endpoints**

#### **User Management**
- **POST `/signup`**:
  - Registers a new user and stores their details in the database.
  - Validates the uniqueness of the username and phone number.

- **POST `/send-verification`**:
  - Sends a verification code to the user's phone number.
  - Used for phone number validation during signup.

- **POST `/verify-code`**:
  - Verifies the phone number by checking the code entered by the user.

- **POST `/check-username`**:
  - Checks if a username is already taken in the database.

- **POST `/check-phone`**:
  - Checks if a phone number is already registered.

#### **Event Management**
- **POST `/create-event`**:
  - Creates a new event and links it to the host's `user_id`.
  - Accepts details like `event_name`, `description`, `date_time`, and `address`.

- **POST `/add-invitees`**:
  - Adds invitees to an event using their `user_ids`.
  - Links the event to the invitees in their `invited_events` array.

- **GET `/get-events`**:
  - Fetches all events for a specific user (both hosted and invited).

- **GET `/admin-events`**:
  - Admin-only endpoint to list all events (active or past).

---

### **How to Run the Project**

#### **1. Prerequisites**
- Docker and Docker Compose installed on your system.
- Node.js and npm installed for React development.

#### **2. Setup**
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd Reach
   ```

2. Run the backend and database using Docker:
   ```bash
   bash setup-app.sh
   ```

3. Navigate to the frontend directory and start the React development server:
   ```bash
   cd flask-app/static/frontend
   npm start
   ```

#### **3. Access the Application**
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

---

### **How It Works**

1. **User Signup**:
   - The user enters their username, password, and phone number.
   - A verification code is sent to their phone for validation.

2. **Creating Events**:
   - Users can create events by filling in details like name, description, and date/time.
   - The event is linked to the user as the host.

3. **Inviting Users**:
   - Hosts can invite other users to their events.
   - Invited users see the event in their dashboard.

4. **Admin Dashboard**:
   - Admins can view a list of all events, including their statuses (active, completed, or cancelled).

---

### **Future Enhancements**
- **Real-Time Notifications**:
  - Notify invitees about events via SMS or email.
- **RSVP Management**:
  - Allow invitees to RSVP to events directly.
- **Search and Filter**:
  - Add functionality to search or filter events by name, host, or date.
- **Analytics Dashboard**:
  - Provide admins with analytics on event activity.
