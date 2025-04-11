import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import { executeTask } from './taskExecutor.js';
import { generatePlan } from './aiPlanner.js';

dotenv.config();

async function main() {
  program
    .name('ai-agent')
    .description('AI-powered task automation agent')
    .version('1.0.0');

  program
    .command('task')
    .description('Execute a task using natural language')
    .argument('<task>', 'Task description')
    .action(async (task) => {
      try {
        // Generate task plan
        const spinner = ora('Generating task plan...').start();
        const plan = await generatePlan(task);
        spinner.succeed('Task plan generated');

        console.log('\n' + chalk.blue('Proposed Plan:'));
        console.log(chalk.yellow(plan.description));
        console.log('\nSteps:');
        plan.steps.forEach((step, index) => {
          console.log(chalk.cyan(`${index + 1}. ${step}`));
        });

        // Ask for confirmation
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to proceed with this plan?',
            default: false
          }
        ]);

        if (confirm) {
          const executionSpinner = ora('Executing task...').start();
          await executeTask(plan);
          executionSpinner.succeed('Task completed successfully');
        } else {
          console.log(chalk.red('Task cancelled'));
        }
      } catch (error) {
        console.error(chalk.red('Error:', error.message));
        process.exit(1);
      }
    });

  program.parse();
}

main().catch(console.error);