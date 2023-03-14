export type Task = string;

export class TodoListContract {
	tasks: Array<Task>;
	constructor(tasks: Array<Task>) {
		this.tasks = tasks || [];
	}

	addTask(task: Task) {
		if (!task) {
			throw new Error('Task not found');
		}
		this.tasks.push(task);
		return `Task ${task} was added`;
	}

	getTasks() {
		return this.tasks;
	}
}
