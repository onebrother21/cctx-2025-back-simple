import { Router } from 'express';
import { InvoicesController as ctrl } from './invoices.controller';
import { InvoicesValidators as validators } from './invoices.validators';
import { loadV5,PostMiddleware,upload } from '@middleware';
import Utils from '@utils';

const InvoicesRouter = () => {
  const router = Router();
  

  // 📌 Invoice CRUD Ops
  router.post("/",loadV5(...validators.createInvoice,ctrl.createInvoice,...PostMiddleware));
  router.get("/:invoiceId",loadV5(ctrl.getInvoiceById,...PostMiddleware));
  router.put("/:invoiceId",loadV5(...validators.updateInvoice, ctrl.updateInvoice,...PostMiddleware));
  router.delete("/:invoiceId",loadV5(ctrl.deleteInvoice,...PostMiddleware));
  router.post("/:invoiceId/send",loadV5(ctrl.sendInvoice,...PostMiddleware));
  router.post("/:invoiceId/paid",loadV5(ctrl.markInvoiceAsPaid,...PostMiddleware));

  return router;
};
export { InvoicesRouter };
export default InvoicesRouter;