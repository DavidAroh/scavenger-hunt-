-- QR 10 is placed at the public boundary of the VIP side. Participants must not enter it.
update public.hunt_checkpoints
   set label = 'VIP side (restricted area)'
 where id = 'registration-table';
