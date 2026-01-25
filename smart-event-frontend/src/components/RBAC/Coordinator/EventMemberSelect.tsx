import { useEffect, useMemo, useState } from "react";
import {
  Checkbox,
  Autocomplete,
  TextField,
  createFilterOptions,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import type { Event } from "../../../types/types";
import { fetchUsers } from "../../../app/userslice";

type Option = {
  label: string;
  value: string;
  isProtected?: boolean;
};
interface Props {
  event: Partial<Event> | null;
  isEditMode: boolean;
  protectedEmails:string[];
  members:string[];
  setMembers: React.Dispatch<React.SetStateAction<string[]>>;
  // onChange?: (emails: string[]) => void;
}

export function EventMembersSelect({ event, isEditMode,protectedEmails, members,setMembers, }: Props) {
  const userlist = useSelector(
    (state: RootState) => state.user.userlist
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!userlist.length) {
      dispatch(fetchUsers());
    }
  }, [dispatch, userlist]);

  const userOptions = useMemo<Option[]>(() => {
    return userlist.map((u) => ({
      label: u.email,
      value: u.email,
      isProtected: protectedEmails.includes(u.email),
    }));
  }, [userlist, protectedEmails]);

  const allEmails = useMemo(
    () => userOptions.map((o) => o.value),
    [userOptions]
  );

  const isAllSelected =
    allEmails.length > 0 &&
    allEmails.every((email) => members.includes(email));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all non-protected
      setMembers(protectedEmails);
    } else {
      // Select all including protected
      setMembers(allEmails);
    }
  };

  const handleChange = ( e: any, newOptions: Option[] ) => {
    const selectedValues = newOptions.map((o) => o.value);
    // If select-all was clicked
    if (
      selectedValues.includes("select-all") ||
      selectedValues.length === allEmails.length
    ) {
      handleSelectAll();
      return;
    }

    // Remove protected if user tries to unselect
    const filtered = [ ...new Set([   ...protectedEmails,   ...selectedValues, ]),
    ];

    setMembers(filtered);
  };

  const filter = createFilterOptions<Option>();

  return (
    <Autocomplete<Option, true, false, false>
      multiple
      disableCloseOnSelect
      size="small"
      options={[
        { label: "Select All", value: "select-all" },
        ...userOptions,
      ]}
      value={userOptions.filter((o) =>
        members.includes(o.value)
      )}
      readOnly={!isEditMode}
      getOptionLabel={(o) => o.label}
      getOptionDisabled={(o) => o.isProtected === true}
      onChange={handleChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        return filtered;
      }}
      renderOption={(props, option, { selected }) => {
        const isSelectAll = option.value === "select-all";
        const {key, ...restProps}= props
        return (
          <li key={key} {...restProps}>
            <Checkbox
              size="small"
              checked={
                isSelectAll ? isAllSelected : selected
              }
              indeterminate={
                isSelectAll &&
                members.length > protectedEmails.length &&
                !isAllSelected
              }
              disabled={option.isProtected}
            />
            {option.label}
          </li>
        );
      }}
      renderTags={(value /* selected Option[] */) => {
        if (isEditMode) {
          return value.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              size="small"
            />
          ));
        }

        // Read-Only mode: show first 4 + count
        const visible = value.slice(0, 4);
        const hiddenCount = value.length - visible.length;
        return (
          <>
            {visible.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
              />
            ))}
            {hiddenCount > 0 && (
              <Chip
                label={`+${hiddenCount} more`}
                size="small"
              />
            )}
          </>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Event Members"
          placeholder="add or remove members"
        />
      )}
    />
  );
}

