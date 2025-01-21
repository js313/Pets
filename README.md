# Pets: Pet Adoption and Rehoming Platform 🐾

Welcome to the **Pets** project! This application is designed to connect pet lovers with opportunities to adopt or rehome pets. Users can browse available pets, interact with shelters, and manage their profiles. Shelter administrators and pet owners can list pets for adoption and manage their respective profiles, ensuring a secure and user-friendly experience.

---

## Features 📝  

### Core Functionality  
- **Browse Pets and Shelters**:  
  - View pets available for adoption from both individual owners and shelters.  
  - Explore shelter profiles, their teams, and the pets under their care.  

- **Search and Filter**:  
  - Filter pets and shelters by location, distance, species, breed, and more.  
  - Advanced search capabilities, including sorting by distance and other criteria.  

- **Adoption Management**:  
  - Easily initiate adoption requests with shelters or individual owners.  
  - Manage pets under your care or shelter.  

- **Interactive Maps**:  
  - Visualize shelters and pets on a map with custom markers.  
  - Navigate to nearby shelters or pets using real-time distance calculations.  

### Secure and Scalable Architecture  
- **Authentication and Authorization**:  
  - Role-based access control for admin, shelter owners, and regular users.  
  - JSON Web Tokens (JWT) for secure session handling and stateless authentication.  

- **Database Design**:  
  - MongoDB as the database, with optimized indexes and references for fast querying.  
  - Relationships for shared entities like locations, ensuring consistency and scalability.  

- **Cloudinary Integration**:  
  - Efficient image upload and management for pets, shelters, and user profiles.  
  - Automatic cleanup of uploaded images if data saving fails.  

### Email Notifications  
- HTML-formatted emails for user actions like adoption updates, password recovery, and profile changes.  
- Custom notifications for shelter updates or pet status changes.  

### User Experience Enhancements  
- **Frontend Features**:  
  - Persistent user session using localStorage, maintaining state even on page reloads.  
  - Alerts and notifications with animations for a smoother experience.  
  - Accessible forms with password visibility toggle and error handling.  
  - Modal confirmations for critical actions like deletions.  

- **Mobile-Responsive Design**:  
  - Optimized for various devices, with a dynamic sidebar for easy navigation.  

### Performance and Optimization  
- **Backend Enhancements**:  
  - Use of `Promise.all` to handle simultaneous asynchronous operations.  
  - Database constraints for uniqueness (e.g., active shelters, user emails).  
  - Fat model architecture to encapsulate business logic and reduce controller complexity.  

- **Frontend Optimization**:  
  - Use of `react-responsive-carousel` for displaying pets and shelters.  
  - Efficient state management with the AppContext.  

### Developer-Friendly Features  
- **Testing and Debugging**:  
  - Comprehensive API testing using Postman.  
  - Clear error messages and sanitized inputs for secure operation.  

- **Modern Build Setup**:  
  - Concurrently run the backend and frontend during development with `npm run start:dev`.  
  - Nodemon for hot-reloading the server during development.  

- **Credit and Tools**:  
  - Mapbox for interactive maps and navigation.  
  - Mockaroo for generating seed data.  
  - Material-UI for consistent and modern UI components.  

---

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Pets.git
   cd Pets
   ```
2. Install dependencies:
   - Install server dependencies:
     ```bash
     npm install
     ```
   - Install client dependencies:
     ```bash
     npm install --prefix client
     ```
4. Create a .env file and configure the following variables
   ```env
    # Database Configuration
    MONGODB_CONNECT=<Your MongoDB connection string>
    
    # Server Configuration
    PORT=<Port number for the server>
    NODE_ENV=<Environment mode: development or production>
    
    # Authentication
    JWT_SECRET=<Your JWT secret key>
    JWT_EXPIRES_IN=<JWT token expiration time, e.g., 90d>
    JWT_COOKIE_EXPIRES_IN=<JWT cookie expiration time in days, e.g., 7>
    
    # Cloudinary (for image upload and storage)
    CLOUDINARY_CLOUD_NAME=<Your Cloudinary cloud name>
    CLOUDINARY_API_KEY=<Your Cloudinary API key>
    CLOUDINARY_API_SECRET=<Your Cloudinary API secret>
    
    # Email Service for Notifications and Password Recovery
    EMAIL_HOST_DEV=<SMTP host for development>
    EMAIL_USER_DEV=<Email user for development>
    EMAIL_PASS_DEV=<Email password for development>
    
    EMAIL_HOST=<SMTP host for production>
    EMAIL_PORT=<SMTP port, e.g., 587>
    EMAIL_USER=<Email user for production>
    EMAIL_PASS=<Email password for production>
   ```
5. Start the application:
   - For development:
     ```bash
     npm run start:dev
     ```
   - For production:
     ```bash
     npm run start:prod
     ```
---

## Contributing 💡

Contributions are welcome! If you want to contribute, please open an issue first to discuss your ideas.

---

## License 📄

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---
