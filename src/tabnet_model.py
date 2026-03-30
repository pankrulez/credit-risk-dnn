import numpy as np
import torch
from pytorch_tabnet.tab_model import TabNetClassifier
from sklearn.metrics import roc_auc_score
import os

def build_and_train_tabnet(X_train, y_train, X_val, y_val, n_features):
    """
    TabNet uses its own sklearn-style fit/predict API.
    It has built-in sequential attention — no custom training loop needed.
    """
    clf = TabNetClassifier(
        n_d=32,                  # width of decision step output
        n_a=32,                  # width of attention embedding
        n_steps=5,               # number of sequential attention steps
        gamma=1.3,               # coefficient for feature reusage
        n_independent=2,
        n_shared=2,
        optimizer_fn=torch.optim.Adam,
        optimizer_params=dict(lr=2e-3, weight_decay=1e-5),
        scheduler_fn=torch.optim.lr_scheduler.StepLR,
        scheduler_params={"step_size": 20, "gamma": 0.9},
        mask_type='sparsemax',   # sparse attention → interpretable feature masks
        verbose=10,
        seed=42,
        device_name='auto'
    )

    clf.fit(
        X_train=X_train, y_train=y_train,
        eval_set=[(X_val, y_val)],
        eval_name=['val'],
        eval_metric=['auc'],
        max_epochs=200,
        patience=20,                    # early stopping
        batch_size=256,
        virtual_batch_size=128,         # ghost batch norm
        num_workers=0,
        drop_last=False,
        weights=1,                      # auto class-weight balancing
    )

    os.makedirs('outputs', exist_ok=True)
    clf.save_model('outputs/tabnet_model')

    val_probs = clf.predict_proba(X_val)[:, 1]
    val_auc   = roc_auc_score(y_val, val_probs)
    print(f"✅ TabNet Val AUC: {val_auc:.4f}")
    return clf


def load_tabnet(n_features):
    clf = TabNetClassifier()
    clf.load_model('outputs/tabnet_model.zip')
    return clf


def get_tabnet_feature_importance(clf, feature_names):
    """Returns TabNet's built-in attention-based feature importances."""
    importances = clf.feature_importances_
    return dict(sorted(
        zip(feature_names, importances),
        key=lambda x: x[1], reverse=True
    ))