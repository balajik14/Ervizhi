import torch
import torch.nn as nn
import numpy as np
import os

class MarketLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=16, num_layers=1, output_size=1):
        super(MarketLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        # Initialize hidden and cell states
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))
        
        # Decode the hidden state of the last time step
        out = self.fc(out[:, -1, :])
        return out

def generate_synthetic_data(num_samples=1000, seq_length=7):
    """
    Generates generic wave-like price patterns for agricultural commodities.
    """
    X = []
    y = []
    for _ in range(num_samples):
        # Random base price level
        base = np.random.uniform(1000, 9000)
        # Random noise and trend
        trend = np.linspace(0, np.random.uniform(-50, 50), seq_length + 1)
        noise = np.random.normal(0, 20, seq_length + 1)
        
        sequence = base + trend + noise
        
        # Normalize the sequence to [0, 1] for training based on a hypothetical max of 10000
        norm_seq = sequence / 10000.0
        
        X.append(norm_seq[:-1].reshape(-1, 1))
        y.append(norm_seq[-1])
        
    return torch.tensor(np.array(X), dtype=torch.float32), torch.tensor(np.array(y), dtype=torch.float32).unsqueeze(1)

def train_model():
    print("Generating synthetic APMC dataset...")
    X_train, y_train = generate_synthetic_data(2000, 7)
    
    model = MarketLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    num_epochs = 100
    print("Starting training...")
    for epoch in range(num_epochs):
        model.train()
        
        # Forward pass
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        
        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 20 == 0:
            print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.6f}')
            
    print("Training complete!")
    
    # Save the model weights
    save_path = os.path.join(os.path.dirname(__file__), 'market_lstm.pt')
    torch.save(model.state_dict(), save_path)
    print(f"Model saved to {save_path}")

if __name__ == '__main__':
    train_model()
