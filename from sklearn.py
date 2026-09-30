from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.tree import DecisionTreeClassifier

# Parameter grid for tuning
param_grid = {
    'criterion': ['gini', 'entropy'],
    'max_depth': [2, 3, 4, None],
    'min_samples_split': [2, 4, 6],
    'min_samples_leaf': [1, 2, 3]
}

# Grid Search
grid = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid,
    cv=5
)

grid.fit(X_train, y_train)

# Best model
best_dt = grid.best_estimator_
y_pred_tuned = best_dt.predict(X_test)

tuned_acc = accuracy_score(y_test, y_pred_tuned)

print("🔹 Best Parameters Found:", grid.best_params_)
print("🔹 Tuned Model Accuracy:", tuned_acc)
print("\nClassification Report (Tuned):\n", classification_report(y_test, y_pred_tuned))
print("\nConfusion Matrix (Tuned):\n", confusion_matrix(y_test, y_pred_tuned))