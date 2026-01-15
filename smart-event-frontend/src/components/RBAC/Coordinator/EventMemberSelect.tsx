import { useMemo, useState } from 'react';
import { Box, Chip, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

export interface User {
  email: string;
  username?: string;
}

interface Props {
  userlist: User[];                 
  event_members: string[];          
  event_coordinator_email: string;  
  event_photographer_email: string; 
  isEditMode: boolean;
  onChange?: (emails: string[]) => void;
}

export function EventMembersSelect({ userlist, event_members, event_coordinator_email, event_photographer_email, isEditMode, 
  onChange,}: Props) {
  // protected users (coordinator and photographer)
  const protectedEmails = useMemo(() => {
    const set = new Set<string>();
    if (event_coordinator_email) set.add(event_coordinator_email);
    if (event_photographer_email) set.add(event_photographer_email);
    return set;
  }, [event_coordinator_email, event_photographer_email]);

  // Always include protected emails in the effective selected list.
  const baseSelected = useMemo(() => {
    return Array.from(
      new Set([...(event_members ?? []), ...Array.from(protectedEmails)])
    );
  }, [event_members, protectedEmails]);

  // Local edit state (no useEffect syncing; we remount when edit mode or event_members changes)
  const [members, setMembers] = useState<string[]>(() => baseSelected);

  // Remount key: when entering edit mode or when server-provided members change, reset local state
  const resetKey = useMemo(() => {
    return `${isEditMode ? "edit" : "view"}:${baseSelected.join("|")}`;
  }, [isEditMode, baseSelected]);

  const value = isEditMode ? members : baseSelected; // shown selected values

  //get the users who are included in event email id as key
  const viewUsers = useMemo(() => userlist.filter(
    (u) => baseSelected.includes(u.email)),
    [userlist, baseSelected]
  );
  //separate the protected members (coordinator and photographer)
  const allSelectableEmails = useMemo(
    () => userlist.map((u) => u.email).filter((email) => !protectedEmails.has(email)),
    [userlist, protectedEmails]
  );

  //currently selected members from selectable members
  const selectableSelectedCount = members.filter((email) => !protectedEmails.has(email)).length;

  const allSelected = selectableSelectedCount === allSelectableEmails.length && allSelectableEmails.length > 0;

  const partiallySelected =
    selectableSelectedCount > 0 &&
    selectableSelectedCount < allSelectableEmails.length;

  // console.log("userlist",userlist);
  // console.log(viewUsers);
  // console.log("allSelectableEmails",allSelectableEmails);
  // console.log("selectableSelectedCount",selectableSelectedCount);
  // console.log(protectedEmails);
  
  
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    if (!isEditMode) return;

    const incoming = event.target.value as string[];

    const next = Array.from(new Set([  ...incoming, 
       ...Array.from(protectedEmails),
  ])
    );

    setMembers(next);
    onChange?.(next);
  };

  
  return (
    <div key={resetKey}>
    <FormControl fullWidth size="small" >
      <InputLabel>Event Members</InputLabel>

      <Select multiple value={value} disabled={!isEditMode}
        onChange={handleChange}
        input={<OutlinedInput label="Event Members" />}
        renderValue={(selected) => {
          const visible = selected.slice(0, 2);
          const hidden = selected.length - visible.length;

          return (
           <Box sx={{ display: 'flex', gap: 0.5, overflow: 'hidden' }}>
              {visible.map((email) => (
                <Chip key={email} label={email} size="small" sx={{ flexShrink: 0 }}/>
              ))}
              {hidden > 0 && (
                <Chip label={`+${hidden}`} size="small" />
              )}
            </Box>
          );
        }}
      >
       {/*  view  */}
        {!isEditMode &&
          viewUsers.map((user) => (
            //already checked users
            <MenuItem key={user.email} value={user.email} disabled>
              <Checkbox checked />
              <ListItemText
                primary={user.email}
                secondary={user.username}
              />
            </MenuItem>
          ))}

        {/* EDIT  */}
        {isEditMode && [
            // select all  excluding the require members
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                const updated = allSelected
                  ? Array.from(protectedEmails)
                  : Array.from(new Set([ ...Array.from(protectedEmails), ...allSelectableEmails ]));

                setMembers(updated);
                onChange?.(updated);
              }}
            >
              <Checkbox checked={allSelected} indeterminate={partiallySelected}/>
              <ListItemText primary="Select All" />
            </MenuItem>,

            userlist.map((user) => {
              const isProtected = protectedEmails.has(user.email);

              return (
                <MenuItem key={user.email} value={user.email} disabled={isProtected} >
                  <Checkbox  checked={members.includes(user.email)}  disabled={isProtected}/>
                  <ListItemText primary={user.email} secondary={
                      isProtected ? 'Required for event' : user.username
                    }
                  />
                </MenuItem>
              );
            }),
      ]}
      </Select>
    </FormControl>
    </div>
  );
}
