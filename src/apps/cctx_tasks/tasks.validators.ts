import { body,param } from 'express-validator';

import { CheckValidation } from '@middleware';
import Types from "@types";
import Utils from '@utils';

export class TasksValidators {
  static createTasks = [[
    body('data').isArray(),
    body('data.*.app').isString().withMessage('Invalid app'),
    body('data.*.type').isString().isIn(["bug","improvements","suggestion","other"]).withMessage('Invalid type'),
    body('data.*.title').isString().withMessage('Invalid title'),
    body('data.*.desc').isString().withMessage('Invalid description'),
  ],CheckValidation()] as IHandler[];
  static createTask = [[
    body('data.app').isString().withMessage('Invalid app'),
    body('data.type').isString().isIn(["bug","improvements","suggestion","other"]).withMessage('Invalid type'),
    body('data.title').isString().withMessage('Invalid title'),
    body('data.desc').isString().withMessage('Invalid description'),
  ],CheckValidation()] as IHandler[];
  
  static updateTask = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.type').isString().isIn(["bug","improvements","suggestion","other"]).withMessage('Invalid type').optional(),
    body('data.title').isString().withMessage('Invalid title'),
    body('data.desc').isString().withMessage('Invalid description').optional(),
    /* NOTES ONLY */
    body('data.notes').isArray().withMessage('Invalid note').optional(),
    body('data.notes.*').isObject().withMessage('Invalid note').optional(),
    body('data.notes.*.body').isNumeric().withMessage('Invalid body'),
    body('data.notes.*.author').isMongoId().withMessage('Invalid authorId'),
  ],CheckValidation()] as IHandler[];
  
  static updateTaskStatus = [[
    param('taskId').isMongoId().withMessage('Invalid task ID'),
    body('data.name').isIn(Object.values(Types.ITaskStatuses)).withMessage('Invalid status value').optional(),
    body('data.info').isString().withMessage('Invalid msg').optional(),
    body('data.progress').isNumeric().withMessage('Invalid value').optional(),
  ],CheckValidation()] as IHandler[];
};
export default TasksValidators;