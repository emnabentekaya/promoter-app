import type { Room, SalleDeBain } from './apartment.ts';

export interface RoomEditorProps {
  room: Room;
  index: number;
  onChange: (patch: Partial<Room>) => void;
  onSdbChange: (patch: Partial<SalleDeBain>) => void;
}
