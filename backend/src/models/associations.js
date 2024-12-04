import Role from './role.js';
import Permissions from './permissions.js';
import User from './user.js';
import RolePermissions from './rolepermissions.js';
import Group from './group.js';
import Subgroup from './subgroup.js';
import ContractType from './contracttype.js';
import ContractRow from './contractrow.js'
import Invoice from './invoice.js';
import Company from './company.js';
import WorkingSite from './workingsite.js';
import Category from './category.js';
import Subcategory from './subcategory.js';
import TechnicalArea from './technicalarea.js';
import QuotationRequest from './quotationrequest.js';
import Offer from './offer.js';
import SalesOrder from './salesorder.js';
import JobSalesOrder from './jobsalesorder.js';
import Job from './job.js';
import Location from './locations.js';
import Reporting from './reporting.js';
import Tasks from './tasks.js';
import OfferTeam from './offerteam.js';
import InvoiceLine from './invoicelines.js';
import Notification from './notification.js';
import Purchase from './purchase.js';
import PurchaseRow from './purchaserow.js';
import Calendar from './calendar.js';
import Locations from './locations.js';
import CommercialOffer from './commercialoffer.js';
import ClientType from './clienttype.js';
import ProjectType from './projecttype.js';
import Assignment from './assignment.js';
import Contract from './contract.js';
import PaymentMethod from './paymentmethod.js';
import Currency from './currency.js';
import Subsubcategory from './subsubcategory.js';
import Recurrence from './recurrence.js';
import MailingList from './mailinglist.js';
import MailingListUser from './mailinglistuser.js';
import Mail from 'nodemailer/lib/mailer/index.js';

// Define associations
User.belongsTo(Role, { foreignKey: 'role' });
Role.hasMany(User, { foreignKey: 'role' });

Role.belongsToMany(Permissions, { through: RolePermissions, foreignKey: 'id_role' });
Permissions.belongsToMany(Role, { through: RolePermissions, foreignKey: 'id_permissions' });

Purchase.belongsTo(Currency, { foreignKey: 'currency' });
Currency.hasMany(Purchase, { foreignKey: 'currency' });

//User is associated with Group
User.belongsTo(Group, { foreignKey: 'group' });
Group.hasMany(User, { foreignKey: 'group' });


//User is associated with Subgroup
User.belongsTo(Subgroup, { foreignKey: 'subgroup' });
Subgroup.hasMany(User, { foreignKey: 'subgroup' });

//User is associated with ContractType
User.belongsTo(ContractType, { foreignKey: 'contracttype' });
ContractType.hasMany(User, { foreignKey: 'contracttype' });

//Role is associated with User in the createdBy, updatedBy, and deletedBy fields
Role.hasMany(User, { foreignKey: 'createdBy' });
Role.hasMany(User, { foreignKey: 'updatedBy' });
Role.hasMany(User, { foreignKey: 'deletedBy' });

//ContractType is associated with User in the createdBy, updatedBy, and deletedBy fields
ContractType.hasMany(User, { foreignKey: 'createdBy' });
ContractType.hasMany(User, { foreignKey: 'updatedBy' });
ContractType.hasMany(User, { foreignKey: 'deletedBy' });

//Invoice is associated with the Company in the Invoicecompany by id_company
Invoice.belongsTo(Company, { foreignKey: 'invoicecompany' });
Company.hasMany(Invoice, { foreignKey: 'invoicecompany' });

//User is associated with WorkingSite
User.belongsTo(WorkingSite, { foreignKey: 'workingsite' });
WorkingSite.hasMany(User, { foreignKey: 'workingsite' });

//Category is associated with Subcategory
Category.hasMany(Subcategory, { foreignKey: 'category' });
Subcategory.belongsTo(Category, { foreignKey: 'category' });


Subcategory.hasMany(Subsubcategory, { foreignKey: 'subcategory' });
Subsubcategory.belongsTo(Subcategory, { foreignKey: 'subcategory' });

//QuotationRequest is associated with Category
QuotationRequest.belongsTo(Category, { foreignKey: 'category' });
Category.hasMany(QuotationRequest, { foreignKey: 'category' });

//QuotationRequest is associated with Subcategory
QuotationRequest.belongsTo(Subcategory, { foreignKey: 'subcategory' });
Subcategory.hasMany(QuotationRequest, { foreignKey: 'subcategory' });

//QuotationRequest is associated with TechnicalArea
QuotationRequest.belongsTo(TechnicalArea, { foreignKey: 'technicalarea' });
TechnicalArea.hasMany(QuotationRequest, { foreignKey: 'technicalarea' });

QuotationRequest.belongsTo(ProjectType, { foreignKey: 'projecttype' });
ProjectType.hasMany(QuotationRequest, { foreignKey: 'projecttype' });

QuotationRequest.belongsTo(Assignment, { foreignKey: 'assignment' });
Assignment.hasMany(QuotationRequest, { foreignKey: 'assignment' });

//QuotationRequest is associated with Company
QuotationRequest.belongsTo(Company, { foreignKey: 'company' });
Company.hasMany(QuotationRequest, { foreignKey: 'company' });

//Location is associated with Calendar
Calendar.belongsTo(Location, { foreignKey: 'location' });
Location.hasMany(Calendar, { foreignKey: 'location' });

//QuotationRequest is associated with User in the createdBy, updatedBy, and deletedBy fields
QuotationRequest.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
QuotationRequest.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
QuotationRequest.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//Offer is associated with User in the createdBy, updatedBy, and deletedBy fields
Offer.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Offer.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Offer.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//Offer is associated with QuotationRequest
Offer.belongsTo(QuotationRequest, { foreignKey: 'quotationrequest' });
QuotationRequest.hasMany(Offer, { foreignKey: 'quotationrequest' });

//salesorder is associated with offer in the offer field
SalesOrder.belongsTo(Offer, { foreignKey: 'offer' });
Offer.hasMany(SalesOrder, { foreignKey: 'offer' });

CommercialOffer.belongsTo(Offer, { foreignKey: 'id_offer' });
Offer.hasMany(CommercialOffer, { foreignKey: 'id_offer' });
Tasks.belongsTo(Offer, { foreignKey: 'task' });
Offer.hasMany(Tasks, { foreignKey: 'task' });


Tasks.belongsTo(Offer, { foreignKey: 'id_offer' });
Offer.hasMany(Tasks, { foreignKey: 'id_offer' });


//salesorder is associated with User in the createdBy, updatedBy, and deletedBy fields
SalesOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
SalesOrder.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
SalesOrder.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//Job has many SalesOrder through JobSalesOrder
Job.belongsToMany(SalesOrder, { through: JobSalesOrder, foreignKey: 'job' });
SalesOrder.belongsToMany(Job, { through: JobSalesOrder, foreignKey: 'salesorder' });

//Offer has many User in the team through OfferTeam
Offer.belongsToMany(User, { through: OfferTeam, foreignKey: 'offer', as:'team' });
User.belongsToMany(Offer, { through: OfferTeam, foreignKey: 'user', as:'team' });

//Job is associated with User in the createdBy, updatedBy, and deletedBy fields
Job.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Job.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Job.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//reporting is associated with Job
Reporting.belongsTo(Job, { foreignKey: 'job' });
Job.hasMany(Reporting, { foreignKey: 'job' });

//reporting is associated with Task
Reporting.belongsTo(Tasks, { foreignKey: 'task' });
Tasks.hasMany(Reporting, { foreignKey: 'task' });

Company.belongsTo(ClientType, { foreignKey: 'companytype' });

ClientType.hasMany(Company, { foreignKey: 'companytype' });

//reporting is associated with User in the createdBy, updatedBy, and deletedBy fields
Reporting.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Reporting.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Reporting.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//reporting is associated with Tasks
Reporting.belongsTo(Tasks, { foreignKey: 'task' });
Tasks.hasMany(Reporting, { foreignKey: 'task' });

//Tasks is associated with User in the createdBy, updatedBy, and deletedBy fields
Tasks.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Tasks.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Tasks.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

//Tasks is associated with Job
Tasks.belongsTo(Job, {
  foreignKey: 'job', // La chiave esterna deve essere coerente con il model Job
  as: 'Job'
});

Job.hasMany(Tasks, {
  foreignKey: 'job', // Devi usare la chiave esterna corretta
  as: 'Task' // L'alias deve corrispondere a quello usato nell'inclusione
});


//Tasks is associated with User in the assignedTo field
Tasks.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedToUser' });
User.hasMany(Tasks, { foreignKey: 'assignedTo' });

//Tasks is associated with Tasks in the parentTask field
Tasks.belongsTo(Tasks, { foreignKey: 'parentTask', as: 'parentTasks' });
Tasks.hasMany(Tasks, { foreignKey: 'parentTask' });

//Invoice Line is associated with Invoice
InvoiceLine.belongsTo(Invoice, { foreignKey: 'invoice' });
Invoice.hasMany(InvoiceLine, { foreignKey: 'invoice' });

//Notification is associated with User in the owner, receiver, createdBy, updatedBy, and deletedBy fields
Notification.belongsTo(User, { foreignKey: 'owner', as: 'ownerUser' });
Notification.belongsTo(User, { foreignKey: 'receiver', as: 'receiverUser' });
Notification.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Notification.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Notification.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

User.hasMany(Notification, { foreignKey: 'owner', as: 'ownerUser' });
User.hasMany(Notification, { foreignKey: 'receiver', as: 'receiverUser' });
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'createdByUser' });
User.hasMany(Notification, { foreignKey: 'updatedBy', as: 'updatedByUser' });
User.hasMany(Notification, { foreignKey: 'deletedBy', as: 'deletedByUser' });

Purchase.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Purchase.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Purchase.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

PurchaseRow.belongsTo(Purchase, { foreignKey: 'id_purchase' });
Purchase.hasMany(PurchaseRow, { foreignKey: 'id_purchase' });

Purchase.belongsTo(Company, { foreignKey: 'id_company' });
Company.hasMany(Purchase, { foreignKey: 'id_company' });

PurchaseRow.belongsTo(Category, { foreignKey: 'category' });
Category.hasMany(PurchaseRow, { foreignKey: 'category' });

PurchaseRow.belongsTo(Subcategory, { foreignKey: 'subcategory' });
Subcategory.hasMany(PurchaseRow, { foreignKey: 'subcategory' });


PurchaseRow.belongsTo(Subsubcategory, { foreignKey: 'subsubcategory' });
Subsubcategory.hasMany(PurchaseRow, { foreignKey: 'subsubcategory' });

Calendar.belongsTo(User, { foreignKey: 'owner', as: 'ownerUser' });
Calendar.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Calendar.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Calendar.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

User.hasMany(Calendar, { foreignKey: 'owner', as: 'ownedCalendars' });
User.hasMany(Calendar, { foreignKey: 'createdBy', as: 'createdCalendars' });
User.hasMany(Calendar, { foreignKey: 'updatedBy', as: 'updatedCalendars' });
User.hasMany(Calendar, { foreignKey: 'deletedBy', as: 'deletedCalendars' });

Contract.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
Contract.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });
Contract.belongsTo(User, { foreignKey: 'deletedBy', as: 'deletedByUser' });

Contract.belongsTo(Company, { foreignKey: 'id_company' });
Company.hasMany(Contract, { foreignKey: 'id_company' });

MailingList.belongsToMany(User, { through: MailingListUser, foreignKey: 'mailinglist', as: 'mailinglistusers'});
User.belongsToMany(MailingList, { through: MailingListUser, foreignKey: 'user',  });

export default {
    User,
    Role,
    Permissions,
    RolePermissions,
    ContractType,
    Locations,
    Group,
    Subgroup,
    Invoice,
    Company,
    WorkingSite,
    Category,
    Subcategory,
    TechnicalArea,
    QuotationRequest,
    ClientType,
    ProjectType,
    Offer,
    SalesOrder,
    JobSalesOrder,
    Job,
    Reporting,
    Tasks,
    Location,
    OfferTeam,
    InvoiceLine,
    Notification,
    Purchase,
    PurchaseRow,
    Calendar,
    Assignment,
    PaymentMethod,
    Currency,
    Subsubcategory,
    Recurrence,
    MailingList,
    ContractRow
  };