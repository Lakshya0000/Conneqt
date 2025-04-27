import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base, baseSepolia, sepolia } from "viem/chains";

export function Provider({ children }) {
    const config={
        appearance: {
          name: 'OnchainKit Playground',
          logo: 'https://onchainkit.xyz/favicon/48x48.png?v4-19-24',
          mode: 'dark',
          theme: 'default',
        },
        wallet: {
          display: 'modal',
        }
      }
  return (
    <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={baseSepolia}
        config={config}
    >
        {children}
    </OnchainKitProvider>
  )
}