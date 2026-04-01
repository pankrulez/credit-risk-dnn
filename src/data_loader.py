import pandas as pd
import numpy as np
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.utils import resample
import torch
from torch.utils.data import Dataset, DataLoader

COLUMN_RENAME = {
    'x1':  'LIMIT_BAL', 'x2':  'SEX',      'x3':  'EDUCATION',
    'x4':  'MARRIAGE',  'x5':  'AGE',       'x6':  'PAY_0',
    'x7':  'PAY_2',     'x8':  'PAY_3',     'x9':  'PAY_4',
    'x10': 'PAY_5',     'x11': 'PAY_6',
    'x12': 'BILL_AMT1', 'x13': 'BILL_AMT2', 'x14': 'BILL_AMT3',
    'x15': 'BILL_AMT4', 'x16': 'BILL_AMT5', 'x17': 'BILL_AMT6',
    'x18': 'PAY_AMT1',  'x19': 'PAY_AMT2',  'x20': 'PAY_AMT3',
    'x21': 'PAY_AMT4',  'x22': 'PAY_AMT5',  'x23': 'PAY_AMT6',
}

class CreditDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32)

    def __len__(self):
        return len(self.y)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


# ── Dataset Loaders ────────────────────────────────────────────────────────────

def load_german_credit():
    """1,000 rows — UCI German Credit via OpenML. No login required."""
    print("📦 Loading German Credit dataset (OpenML)...")
    data = fetch_openml(name='credit-g', version=1, as_frame=True, parser='auto')
    df   = data.frame.copy()
    X    = df.drop(columns=['class'])
    y    = (df['class'] == 'bad').astype(int).values

    cat_cols = X.select_dtypes(include=['category', 'object']).columns
    le = LabelEncoder()
    for col in cat_cols:
        X[col] = le.fit_transform(X[col].astype(str))

    print(f"   Shape: {X.shape} | Default rate: {np.mean(y):.1%}")
    return X.values.astype(np.float32), y, X.columns.tolist()


def load_default_credit():
    """30,000 rows — Taiwan credit card default via OpenML. No login required."""
    print("📦 Loading Default of Credit Card Clients dataset (OpenML)...")
    data = fetch_openml(
        name='default-of-credit-card-clients',
        version=1, as_frame=True, parser='auto'
    )

    # ── Use data.data (features) and data.targets (label) separately ──────────
    # Avoids column name guessing — works regardless of OpenML version
    X = data.data.copy()
    y_raw = data.target  # pandas Series

    # DEBUG: uncomment if issues persist
    # print("Columns:", X.columns.tolist())
    # print("Target name:", data.target.name, "| Unique:", y_raw.unique())

    # Target may be string ('1','0') or int depending on OpenML version
    y = y_raw.astype(int).values   # 1 = defaulted next month

    # ── Encode categoricals ───────────────────────────────────────────────────
    cat_cols = X.select_dtypes(include=['category', 'object']).columns
    le = LabelEncoder()
    for col in cat_cols:
        X[col] = le.fit_transform(X[col].astype(str))

    feature_names = X.columns.tolist()
    X = X.values.astype(np.float32)

    # ── Handle class imbalance (~22% default rate) ────────────────────────────
    df_temp = pd.DataFrame(X, columns=feature_names)
    df_temp['__target__'] = y

    df_majority = df_temp[df_temp['__target__'] == 0]
    df_minority = df_temp[df_temp['__target__'] == 1]
    df_min_up   = resample(
        df_minority, replace=True,
        n_samples=int(len(df_majority) * 0.4),
        random_state=42
    )
    df_balanced = pd.concat([pd.DataFrame(df_majority), pd.DataFrame(df_min_up)])\
                    .sample(frac=1, random_state=42)\
                    .reset_index(drop=True)

    X_out = df_balanced.drop(columns=['__target__']).values.astype(np.float32)
    y_out = df_balanced['__target__'].values.astype(np.float32)

    print(f"   Shape: {X_out.shape} | Default rate after resampling: {np.mean(np.array(y_out)):.1%}")
    return X_out, y_out, feature_names


def load_give_me_some_credit(path='data/cs-training.csv'):
    """150,000 rows — Kaggle Give Me Some Credit. Requires manual CSV download."""
    import os
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"'{path}' not found.\n"
            "Download from: https://www.kaggle.com/competitions/GiveMeSomeCredit/data\n"
            "Place cs-training.csv in the data/ folder."
        )
    print(f"📦 Loading Give Me Some Credit dataset from {path}...")
    df = pd.read_csv(path, index_col=0)
    df.dropna(inplace=True)
    df = df[df['age'] > 0]

    X = df.drop(columns=['SeriousDlqin2yrs'])
    y = df['SeriousDlqin2yrs'].values

    df_majority = df[df['SeriousDlqin2yrs'] == 0]
    df_minority = df[df['SeriousDlqin2yrs'] == 1]
    df_min_up   = resample(df_minority, replace=True,
                            n_samples=len(df_majority) // 3, random_state=42)
    df_maj_dn   = resample(df_majority, replace=False,
                            n_samples=len(df_majority) // 2, random_state=42)
    df_balanced = pd.concat([pd.DataFrame(df_maj_dn, columns=df.columns), pd.DataFrame(df_min_up, columns=df.columns)], axis=0)

    X_out = df_balanced.drop(columns=['SeriousDlqin2yrs']).values.astype(np.float32)
    y_out = np.array(df_balanced['SeriousDlqin2yrs'].values, dtype=np.float32)
    feature_names = df.drop(columns=['SeriousDlqin2yrs']).columns.tolist()

    print(f"   Shape: {X_out.shape} | Default rate after resampling: {np.mean(y_out):.1%}")
    return X_out, y_out, feature_names


# ── Main Entry Point ───────────────────────────────────────────────────────────

DATASET_MAP = {
    'german': load_german_credit,
    'default': load_default_credit,
    'gmsc': load_give_me_some_credit,
}


def load_and_preprocess(dataset='default'):
    if dataset not in DATASET_MAP:
        raise ValueError(
            f"Unknown dataset '{dataset}'. Choose from: {list(DATASET_MAP.keys())}"
        )

    X, y, feature_names = DATASET_MAP[dataset]()

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15, random_state=42, stratify=y_train
    )

    batch = 256 if dataset != 'german' else 32

    loaders = {
        'train': DataLoader(CreditDataset(X_train, y_train),
                            batch_size=batch, shuffle=True,  num_workers=0),
        'val':   DataLoader(CreditDataset(X_val,   y_val),
                            batch_size=batch, shuffle=False, num_workers=0),
        'test':  DataLoader(CreditDataset(X_test,  y_test),
                            batch_size=batch, shuffle=False, num_workers=0),
    }

    print(f"\n✅ Data ready | Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")
    print(f"   Features: {len(feature_names)}")
    return loaders, X_test, y_test, scaler, feature_names, X_train, X_val, y_val