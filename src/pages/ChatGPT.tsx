import { ChatGPTPlaygroundPage } from '@/components/extensions/chatgpt-polza/ChatGPTPlaygroundPage';

const API_URL = 'https://functions.poehali.dev/6cb2479e-e4ed-496b-b5a5-218c542ec2bf';

export default function ChatGPT() {
  return (
    <ChatGPTPlaygroundPage
      apiUrl={API_URL}
      defaultModel="openai/gpt-4o-mini"
    />
  );
}
