import { body,param } from 'express-validator';

import { CheckValidation } from '../../../../middlewares';
import UpcentricTypes from '../../types';
import Types from "../../../../types";
import Utils from '../../../../utils';

export class TasksValidators {
  // 📌 Task & Fulfillment Validators
  static createTask = [[
    body('data.title').isString().withMessage('Invalid title'),
    body('data.project').isString().withMessage('Invalid project'),
    body('data.lob').isString().withMessage('Invalid lob'),
    body('data.execAction').isString().withMessage('Invalid exec action'),
    body('data.desc').isString().withMessage('Invalid description'),
    body('data.dueOn').isISO8601().withMessage('Invalid due date'),
    body('data.startOn').isISO8601().withMessage('Invalid start date'),
  ],CheckValidation()] as IHandler[];
  
  static updateTask = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.title').isString().withMessage('Invalid title').optional(),
    body('data.project').isString().withMessage('Invalid project').optional(),
    body('data.lob').isString().withMessage('Invalid lob').optional(),
    body('data.execAction').isString().withMessage('Invalid exec action').optional(),
    body('data.desc').isString().withMessage('Invalid description').optional(),
    body('data.dueOn').isISO8601().withMessage('Invalid due date').optional(),
    body('data.startOn').isISO8601().withMessage('Invalid start date').optional(),
  ],CheckValidation()] as IHandler[];
  
  static updateTaskStatus = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.name').isIn(Object.values(UpcentricTypes.ITaskStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
};
export default TasksValidators;