import TodoCard from './components/TodoCard';

// Sample task data — due date set ~3 days from now to show "Due in 3 days"
const sampleTodo = {
  title: 'Redesign Dashboard UI',
  description:
    'Revamp the analytics dashboard with the new design system. Include updated charts, improved navigation, and responsive layout for mobile devices.',
  priority: 'High',
  dueDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(17, 0, 0, 0);
    return d.toISOString();
  })(),
  status: 'In Progress',
  tags: ['Design', 'Frontend', 'Sprint 4'],
};

function App() {
  return (
    <main>
      <TodoCard todo={sampleTodo} />
    </main>
  );
}

export default App;
