import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Bidirectional

# Create small synthetic tokenized data so the example can run end-to-end
rng = np.random.default_rng(42)

X_train = rng.integers(0, 10000, size=(1200, 30), dtype=np.int32)
y_train = np.array([1 if i % 2 == 0 else 0 for i in range(1200)], dtype=np.int32)

X_test = rng.integers(0, 10000, size=(300, 30), dtype=np.int32)
y_test = np.array([1 if i % 2 == 0 else 0 for i in range(300)], dtype=np.int32)

# Reduce dataset size for speed
X_train_small = X_train[:10000]
y_train_small = y_train[:10000]

X_test_small = X_test[:5000]
y_test_small = y_test[:5000]

# Simpler & faster model
model = Sequential()
model.add(Embedding(input_dim=10000, output_dim=64))
model.add(LSTM(64))
model.add(Dense(1, activation='sigmoid'))

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train (fewer epochs)
history = model.fit(X_train_small, y_train_small, epochs=2, batch_size=128, validation_split=0.2)

# Evaluate
loss, accuracy = model.evaluate(X_test_small, y_test_small)
print("Test Accuracy:", accuracy)

X_train_med = X_train[:25000]
y_train_med = y_train[:25000]

X_test_med = X_test[:10000]
y_test_med = y_test[:10000]

model = Sequential()
model.add(Embedding(10000, 128))
model.add(Bidirectional(LSTM(128, return_sequences=True)))
model.add(Dropout(0.3))
model.add(LSTM(64))
model.add(Dense(1, activation='sigmoid'))

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

history = model.fit(
    X_train_med,
    y_train_med,
    epochs=3,
    batch_size=64,
    validation_split=0.2
)

loss, accuracy = model.evaluate(X_test_med, y_test_med)
print("Test Accuracy:", accuracy)
