# FaceSync - Auto Face Capture with Real-Time Feedback

### Overview
The Auto Face Capture feature is designed to provide real-time feedback, ensuring users meet all photo requirements before their image is automatically captured. By guiding users with on-screen prompts, it delivers a seamless experience that enhances photo quality and compliance.

### Key Features

- **Face Detection**: Recognizes and tracks facial landmarks, such as eyes, nose, mouth, and other key facial attributes, to ensure proper alignment and positioning.

- **Validation**: Checks essential conditions in real-time, including:
  - **Lighting**: Ensures adequate lighting to avoid shadows and highlights.
  - **Face Alignment**: Guides users to maintain a forward-facing position.
  - **Distance**: Ensures the face is at an optimal distance from the camera.
  - **Obstructions**: Alerts if the face is partially covered (e.g., by hands or objects).

- **Auto Capture**: Once all conditions are met, the system triggers an automatic capture after a short countdown, ensuring consistent, high-quality captures without user intervention.

### Tools Used

- **MediaPipe Face Detector ML Model**: Provides precise identification of facial landmarks, returning the x, y, and z coordinates of key facial points. This enables accurate face tracking and validation for seamless auto-capture.
  - **Reference**: [MediaPipe Face Detector](https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector)

- **React**: Used for rendering the user interface, ensuring a responsive and interactive front-end experience.

### Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd auto-face-capture
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

4. **Configuration (Optional):**
   Configure environment variables or settings as needed in `.env`.

### Usage

- Launch the app, position yourself in front of the camera, and follow the on-screen instructions. The app will guide you with real-time feedback on alignment, lighting, and other parameters until all conditions are met for a successful capture.

---
