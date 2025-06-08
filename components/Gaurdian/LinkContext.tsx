import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LinkContextType = {
  targetIdNum: number | null;
  targetIdStr: string | null;
  setLink: (numericId: number, foundId: string) => void;
};

const LinkContext = createContext<LinkContextType>({
  targetIdNum: null,
  targetIdStr: null,
  setLink: () => {},
});

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetIdNum, setTargetIdNum] = useState<number | null>(null);
  const [targetIdStr, setTargetIdStr] = useState<string | null>(null);

  // ✅ 앱 시작 시 저장된 연동 정보 불러오기
  useEffect(() => {
    const restoreLink = async () => {
      try {
        const storedNum = await AsyncStorage.getItem('linkedUserId');
        const storedStr = await AsyncStorage.getItem('linkedUserName');

        if (storedNum && storedStr) {
          setTargetIdNum(parseInt(storedNum, 10));
          setTargetIdStr(storedStr);
        }
      } catch (e) {
        console.warn('[LinkContext] 연동 정보 복원 실패:', e);
      }
    };

    restoreLink();
  }, []);

  // ✅ 연동 정보 저장 시 AsyncStorage에도 저장
  const setLink = async (numericId: number, foundId: string) => {
    try {
      await AsyncStorage.setItem('linkedUserId', numericId.toString());
      await AsyncStorage.setItem('linkedUserName', foundId);

      setTargetIdNum(numericId);
      setTargetIdStr(foundId);
    } catch (e) {
      console.warn('[LinkContext] 연동 정보 저장 실패:', e);
    }
  };

  return (
    <LinkContext.Provider value={{ targetIdNum, targetIdStr, setLink }}>
      {children}
    </LinkContext.Provider>
  );
};

export const useLink = () => useContext(LinkContext);
