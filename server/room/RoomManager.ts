import Room from './Room'

export default class RoomManager {
	private static instance: RoomManager
	private rooms: Map<string, Room>

	private constructor() {
		this.rooms = new Map()
	}

	public static getInstance(): RoomManager {
		if (!RoomManager.instance) {
			RoomManager.instance = new RoomManager()
		}

		return RoomManager.instance
	}

	createRoom(roomId: string): Room {
		if (!roomId) {
			throw new Error('Room ID is required')
		}

		if (this.rooms.has(roomId)) {
			throw new Error(`Room ${roomId} already exists`)
		}

		const room = new Room(roomId)
		this.rooms.set(roomId, room)
		return room
	}

	getRoom(roomId: string): Room {
		if (!roomId) {
			throw new Error('Room ID is required')
		}

		const room = this.rooms.get(roomId)
		if (!room) {
			throw new Error(`Room ${roomId} not found`)
		}

		return room
	}

	removeRoom(roomId: string): void {
		if (!roomId) {
			throw new Error('Room ID is required')
		}

		if (!this.rooms.delete(roomId)) {
			throw new Error(`Room ${roomId} not found`)
		}
	}

	cleanEmptyRooms(): void {
		for (const [roomId, room] of this.rooms.entries()) {
			if (room.clientCount === 0) {
				this.removeRoom(roomId)
			}
		}
	}
}
