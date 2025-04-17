import { getProfileConfig } from "@/contract/function";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";

const channelContext = createContext(null);

export function ChannelProvider({ children }) {
    const [profileData, setProfileData] = useState([]);
    const {address,isConnected} = useAccount();
    const config = useConfig();
    console.log("Address:", address)
    console.log("Profile context : ",profileData)
    const fetchProfile = async () => {
        if(!address || !isConnected){
            setProfileData([]);
            return;
        }
        const profile = await readContract(config, {...getProfileConfig, args:[address]});
        console.log(profile)
        setProfileData(profile);
    }
    useEffect(() => {
        fetchProfile();
    },[address,isConnected])
    return (
        <channelContext.Provider value={{profileData,fetchProfile}}>
        {children}
        </channelContext.Provider>
    );
}

export function useWalletContext() {
    const context = useContext(channelContext);
    if (!context) {
        throw new Error("useWalletContext must be used within a ChannelProvider");
    }
    // console.log("context : ",context)
    return context;
}