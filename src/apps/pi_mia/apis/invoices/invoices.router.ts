import { Router } from 'express';
import { InvoicesController as ctrl } from './invoices.controller';
import { InvoicesValidators as validators } from './invoices.validators';
import { PostMiddleware,upload } from '@middleware';
import Utils from '@utils';

const InvoicesRouter = () => {
  const router = Router();
  

  // 📌 Invoice CRUD Ops
  router.post("/",[...validators.createInvoice,ctrl.createInvoice,...PostMiddleware]);
  router.get("/:invoiceId",[ctrl.getInvoiceById,...PostMiddleware]);
  router.put("/:invoiceId",[...validators.updateInvoice, ctrl.updateInvoice,...PostMiddleware]);
  router.delete("/:invoiceId",[ctrl.deleteInvoice,...PostMiddleware]);
  router.post("/:invoiceId/send",[ctrl.sendInvoice,...PostMiddleware]);
  router.post("/:invoiceId/paid",[ctrl.markInvoiceAsPaid,...PostMiddleware]);

  return router;
};
export { InvoicesRouter };
export default InvoicesRouter;