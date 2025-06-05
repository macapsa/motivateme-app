import React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [goal, setGoal] = React.useState('');

  const handleGoalSubmit = () => {
    alert(`Great! Let's go crush: "${goal}"`);
    setGoal('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Good Morning, Michael! 🌅</Text>
      <Text style={styles.quote}>“You are capable of amazing things.”</Text>

      <Text style={styles.prompt}>What’s your goal today?</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your goal..."
        value={goal}
        onChangeText={setGoal}
      />
      <Button title="Submit Goal" onPress={handleGoalSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6ec',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 30,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
