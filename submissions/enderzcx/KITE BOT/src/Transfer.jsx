import { useState } from 'react';
import { ethers } from 'ethers';
import { GokiteAASDK } from './gokite-aa-sdk';
import './App.css';

function Transfer({ onBack }) {
  const [aaWallet, setAAWallet] = useState('');
  const [owner, setOwner] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [loading, setLoading] = useState(false);
  const [senderBalance, setSenderBalance] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [userOpHash, setUserOpHash] = useState('');
  const [status, setStatus] = useState('');

  const sdk = new GokiteAASDK({
    rpcUrl: import.meta.env.VITE_KITE_RPC_URL || 'https://rpc-testnet.gokite.ai',
    bundlerUrl: import.meta.env.VITE_BUNDLER_URL || 'https://bundler-service.staging.gokite.ai/rpc/',
    entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
    proxyAddress: import.meta.env.VITE_AA_WALLET_ADDRESS || '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
  });

  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';

  const handleConnectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setOwner(address);
        setAAWallet(sdk.config.proxyAddress);

        const balance = await sdk.getBalance();
        setSenderBalance(ethers.formatEther(balance));

        alert(`钱包已连接: ${address}`);
      } else {
        alert('请安装 MetaMask 或其他钱包。');
      }
    } catch (error) {
      alert(`连接失败: ${error.message}`);
    }
  };

  const handleTransfer = async () => {
    if (!privateKey) {
      alert('请先配置私钥。');
      return;
    }

    if (!recipient || !amount) {
      alert('请填写接收地址和金额。');
      return;
    }

    try {
      setLoading(true);
      setStatus('');

      const provider = new ethers.JsonRpcProvider(sdk.config.rpcUrl);
      const signer = new ethers.Wallet(privateKey, provider);

      const balance = await sdk.getBalance();
      setSenderBalance(ethers.formatEther(balance));

      const signFunction = async (userOpHash) => {
        return signer.signMessage(ethers.getBytes(userOpHash));
      };

      const result = await sdk.sendUserOperationAndWait({
        target: recipient,
        value: ethers.parseEther(amount),
        callData: '0x'
      }, signFunction);

      if (result.status === 'success') {
        setStatus('success');
        setTxHash(result.transactionHash);
        setUserOpHash(result.userOpHash);

        const newBalance = await sdk.getBalance();
        setSenderBalance(ethers.formatEther(newBalance));
      } else {
        setStatus('failed');
        alert(`转账失败: ${result.reason}`);
      }
    } catch (error) {
      setStatus('error');
      alert(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-container">
      <div className="top-entry">
        {onBack && (
          <button className="link-btn" onClick={onBack}>
            返回需求页面
          </button>
        )}
      </div>

      <h1>Gokite Account Abstraction</h1>

      <div className="info-card">
        <h2>账户信息</h2>
        <div className="info-row">
          <span className="label">AA 钱包:</span>
          <span className="value">{aaWallet || sdk.config.proxyAddress}</span>
        </div>
        <div className="info-row">
          <span className="label">Owner:</span>
          <span className="value">{owner || '未连接'}</span>
        </div>
      </div>

      <div className="balance-card">
        <h2>余额</h2>
        <div className="info-row">
          <span className="label">{aaWallet || sdk.config.proxyAddress}:</span>
          <span className="value">{senderBalance} ETH</span>
        </div>
      </div>

      <div className="transfer-card">
        <h2>转账</h2>
        <button
          onClick={handleConnectWallet}
          className="connect-btn"
        >
          {owner ? '已连接' : '连接钱包'}
        </button>

        <div className="form-group">
          <label>
            接收地址:
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              disabled={loading}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            金额 (ETH):
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              disabled={loading}
            />
          </label>
        </div>
        <button
          onClick={handleTransfer}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? '转账中...' : '转账'}
        </button>
      </div>

      {status === 'success' && (
        <div className="success-card">
          <h2>转账成功!</h2>
          <div className="info-row">
            <span className="label">交易哈希:</span>
            <span className="value hash">{txHash}</span>
          </div>
          <div className="info-row">
            <span className="label">UserOp Hash:</span>
            <span className="value hash">{userOpHash}</span>
          </div>
          <div className="balance-update">
            <h3>转账后余额</h3>
            <div className="info-row">
              <span className="label">{aaWallet || sdk.config.proxyAddress}:</span>
              <span className="value">{senderBalance} ETH</span>
            </div>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="error-card">
          <h2>转账失败</h2>
        </div>
      )}

      {status === 'error' && (
        <div className="error-card">
          <h2>发生错误</h2>
        </div>
      )}
    </div>
  );
}

export default Transfer;

