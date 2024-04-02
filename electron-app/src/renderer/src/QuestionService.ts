export default {
    async loadQuestions() {
      try {
        const response = await fetch('questions.json');
        const data = await response.json();
        return data.questions;
      } catch (error) {
        console.error('Error loading questions:', error);
        return [];
      }
    }
  };