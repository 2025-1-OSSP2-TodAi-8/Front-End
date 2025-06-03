import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

type Props = {
  year: number;
  month: number;
  onYearChange: (newYear: number) => void;
  onMonthChange: (newMonth: number) => void;
};

const YearMonthSelector = ({ year, month, onYearChange, onMonthChange }: Props) => {
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = direction === 'prev' ? month - 1 : month + 1;
    if (newMonth < 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else if (newMonth > 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(newMonth);
    }
  };

  const yearOptions = Array.from({ length: 20 }, (_, i) => year - 10 + i); // +-10년 선택 가능

  return (
    <View style={styles.container}>
      {/* 연도 선택 */}
      <TouchableOpacity onPress={() => setYearModalVisible(true)}>
        <Text style={styles.yearText}>{year}년</Text>
      </TouchableOpacity>

      {/* 월 이동 */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')}>
          <Text style={styles.arrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{month}월</Text>
        <TouchableOpacity onPress={() => handleMonthChange('next')}>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 연도 선택 모달 */}
      <Modal visible={yearModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <FlatList
            data={yearOptions}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                onYearChange(item);
                setYearModalVisible(false);
              }}>
                <Text style={styles.modalItem}>{item}년</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60, // 하단 여유
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A0DAD',
    paddingTop: 16, // ✅ 위에서 내리는 방식
    marginBottom: 4, // ❌ 이건 작게 유지 or 제거
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,  // ✅ 이걸로 띄우고
    marginBottom: 4, // ❌ 너무 크지 않게
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#6A0DAD',
  },
  arrow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 60,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalItem: {
    fontSize: 16,
    padding: 12,
    textAlign: 'center',
  },
});

export default YearMonthSelector;