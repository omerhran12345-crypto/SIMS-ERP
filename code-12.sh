# حمّل الموديلات رسمياً:
mkdir -p public/models
curl -L https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model.bin -o public/models/tiny_face_detector_model.bin
curl -L https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model.json -o public/models/tiny_face_detector_model.json
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model.bin -o public/models/face_landmark_68_model.bin
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model.json -o public/models/face_landmark_68_model.json
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model.bin -o public/models/face_recognition_model.bin
curl -L https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model.json -o public/models/face_recognition_model.json
