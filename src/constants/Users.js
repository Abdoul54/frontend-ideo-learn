// frontend/src/constants/Users.js
import OptionMenu from "@/@core/components/option-menu";
import { Tooltip } from "@mui/material";
import * as yup from 'yup';

export const usersColumns = (handleDeleteUser, handleEditUser) => [
  {
    header: 'Username',
    accessorKey: 'username',
    flex: 1,
    enableSorting: true,
  },
  {
    header: 'First Name',
    accessorKey: 'first_name',
    flex: 1,
    enableSorting: true,
  },
  {
    header: 'Last Name',
    accessorKey: 'last_name',
    flex: 1,
    enableSorting: true,
  },
  {
    header: 'Email',
    accessorKey: 'email',
    flex: 1,
    enableSorting: true,
  },
  // {
  //   header: 'Status',
  //   accessorKey: 'valid', // Assuming 'valid' represents status (1=active, 0=inactive)
  //   cell: ({ row }) => (
  //     <span className={row.original.valid === 1 ? 'text-green-500' : 'text-red-500'}>
  //       {row.original.valid === 1 ? 'Active' : 'Deactivated'}
  //     </span>
  //   ),
  //   enableSorting: true,
  // },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <OptionMenu
        options={[
          {
            text: 'Edit',
            icon: <i className="solar-pen-outline" />,
            menuItemProps: {
              onClick: (e) => {
                e.stopPropagation();
                handleEditUser(row.original);
              },
              className: 'flex items-center gap-2',
            },
          },
          {
            text: 'Remove from Haykal',
            icon: <i className="solar-folder-error-line-duotone text-base" />,
            menuItemProps: {
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteUser(row.original);
              },
              className: 'flex items-center gap-2 text-error hover:bg-errorLight',
            },
          },
        ]}
      />
    ),
    enableSorting: false,
    flex: 0.1,
  },
];

export const customCellRenderers = {
  status: ({ row }) => (
    <Tooltip
      title={row?.original?.is_default ? "Default" : row?.original?.status === "1" ? 'Active' : 'Inactive'}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: row?.original?.is_default ? "info.main" : row?.original?.status === "1" ? 'success.main' : 'error.main',
            color: 'white',
          }
        }
      }}
    >
      <i className={`${row?.original?.is_default ? "solar-check-circle-bold-duotone text-info" : row?.original?.status === "1" ? "solar-check-circle-outline text-success" : "solar-close-circle-outline text-error"} text-xl`} />
    </Tooltip>
  ),
};

export const actionColumn = (handleDeleteUser, handleEditUser) => {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <OptionMenu
        options={[
          {
            text: 'Edit',
            icon: <i className="solar-pencil-line-duotone text-base" />,
            menuItemProps: {
              onClick: (e) => {
                e.stopPropagation();
                handleEditUser(row.original);
              },
              className: 'flex items-center gap-2',
            },
          },
          {
            text: 'Remove from Haykal',
            icon: <i className="solar-folder-error-line-duotone text-base" />,
            menuItemProps: {
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteUser(row.original);
              },
              className: 'flex items-center gap-2 text-error hover:bg-errorLight',
            },
          }
        ]}
      />
    ),
    enableSorting: false,
    flex: 0.1,
  }
}

export const defaultValues = {
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  firstname: '',
  lastname: '',
  level: 6,
  language: 'en',
  expiration: '',
  timezone: 'Europe/Paris',
  email_validation_status: 0,
  valid: 1,
  manager: {},
  force_change: 0,
  employees: {},
  select_orgchart: [],
  can_manage_subordinates: false,
  additional_fields: {},
  send_notification_email: false
};

export const createUserSchema = (managerTypes = [], isUpdate = false) => {
  // Create schema shape for manager field - needs to handle nested user objects
  const managerShape = managerTypes.reduce((acc, type) => {
    acc[type.manager_type_id] = yup.object().shape({
      user: yup.mixed().nullable(), // This will hold the selected user object
      can_manage: yup.boolean().default(false)
    }).default(undefined);
    return acc;
  }, {});

  // Schema for employees - arrays of string IDs for each manager type
  const employeesShape = {};
  managerTypes.forEach(type => {
    employeesShape[type.manager_type_id] = yup
      .array()
      .of(yup.string())
      .default([]);
  });

  return yup.object().shape({
    username: yup.string().required('Username is required').max(255),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string()
      .when([], {
        is: () => !isUpdate, // Only required during create
        then: (schema) => schema.required('Password is required').min(8, 'Password must be at least 8 characters'),
        otherwise: (schema) => schema.test({
          name: 'min-length-if-provided',
          message: 'Password must be at least 8 characters',
          test: value => {
            // If no value is provided or it's an empty string, it's valid (not required for updates)
            // Otherwise, check if it meets the minimum length
            return !value || value.trim() === '' || value.length >= 8;
          }
        })
      }),
    password_confirmation: yup.string()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
    firstname: yup.string().nullable(),
    lastname: yup.string().nullable(),
    level: yup.number().oneOf([3, 4, 6], 'Invalid level'),
    expiration: yup.string().nullable(),
    email_validation_status: yup.number().oneOf([0, 1]),
    force_change: yup.mixed()
      .transform(value => value === true ? 1 : 0)
      .default(0),
    valid: yup.mixed()
      .transform(value => value === true ? 1 : 0)
      .default(1),
    timezone: yup.string().nullable(),

    // Manager uses nested object structure
    manager: yup.object()
      .shape(managerShape)
      .default({}),

    can_manage_subordinates: yup.boolean().default(false),
    group_membership: yup.array().of(yup.mixed()).nullable(),
    additional_fields: yup.object().test({
      name: 'validate-required-fields',
      message: 'Please fill all required fields',
      test: function (value) {
        const { userfields, isUpdate } = this.options.context || {};
        // Get advancedSettings from context
        const { shouldShowUserFields = false } = this.options.context || {};

        // Skip validation if user fields are disabled in system settings
        if (!shouldShowUserFields) return true;

        if (!userfields) return true;

        const fields = Array.isArray(userfields) ? userfields :
          (userfields.data && Array.isArray(userfields.data) ? userfields.data : []);

        if (fields.length === 0) return true;

        const missingFields = fields
          .filter(field => field && field.mandatory)
          .filter(field => !value || value[field.id] === undefined || value[field.id] === '');

        return missingFields.length === 0;
      }
    }),
    employees: yup.object()
      .shape(employeesShape)
      .default({}),
    select_orgchart: yup.array()
      .of(yup.number())
      .nullable()
      .transform(value => {
        // If value is null or empty array, default to [1]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return [1]; // Default to Platform branch
        }
        return value;
      }),
  });
};