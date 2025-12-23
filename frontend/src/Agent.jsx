import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

export function Agent() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected to Agent'),
    onDisconnect: () => console.log('Disconnected from Agent'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Agent Error:', error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: 'agent_9701kbhbgqveft3vwkrkerwzmaaz',
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleConversation = () => {
    if (conversation.status === 'connected') {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const getButtonClass = () => {
    if (conversation.status === 'connected') return 'agent-button connected';
    if (conversation.status === 'connecting') return 'agent-button connecting';
    return 'agent-button';
  };

  return (
    <div className="agent-widget">
      <div
        className={getButtonClass()}
        onClick={toggleConversation}
        title={conversation.status === 'connected' ? 'Disconnect' : 'Connect'}
      >
        🤖
        <div className={`agent-status-dot ${conversation.status === 'connected' ? 'active' : ''}`}></div>
      </div>
      <span className="agent-label">Helping Agent</span>
    </div>
  );
}
