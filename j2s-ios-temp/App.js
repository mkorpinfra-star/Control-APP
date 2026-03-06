import React, { useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';

export default function App() {
  useEffect(() => {
    // Redirecionar para o site assim que abrir
    Linking.openURL('https://j2s.ad/login');
  }, []);

  return (
    <View style={styles.container}>
      {/* App vazio que só redireciona */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CE0201',
  },
});
