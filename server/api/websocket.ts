import RoomManager from '../room/RoomManager'
import type { GameMessage, Payload } from '~/types/ticTacToe'
import { serialize } from '~/utils/gameUtils'
import { logger } from '~/utils/logger'

const roomManager = RoomManager.getInstance()

export default defineWebSocketHandler({
	open(peer) {
		logger.log('Client connected:', peer.id)
	},

	message(peer, message) {
		try {
			const parsedMessage = JSON.parse(message as unknown as string) as GameMessage

			switch (parsedMessage.type) {
				case 'JOIN_ROOM': {
					handleJoinRoom(peer, parsedMessage.payload as Payload)
					break
				}

				case 'MAKE_MOVE': {
					handleMakeMove(peer, parsedMessage.payload as Payload)
					break
				}

				default: {
					logger.warn('Unknown message type:', parsedMessage.type)
				}
			}
		} catch (error) {
			logger.error('Error processing message:', error)
			peer.send(
				serialize({
					type: 'ERROR',
					payload: 'Failed to process message',
				})
			)
		}
	},

	close(peer) {
		logger.log('Client disconnected:', peer.id)
		handlePeerDisconnection(peer)
		roomManager.cleanEmptyRooms()
	},

	error(peer, error) {
		logger.error('WebSocket error:', error)
		handlePeerDisconnection(peer)
	},
})

function handleJoinRoom(peer: any, payload: Payload) {
	const { roomId } = payload
	let room = null

	try {
		room = roomManager.getRoom(roomId)
	} catch {
		logger.log('Creating new room:', roomId)
		room = roomManager.createRoom(roomId)
	}

	const symbol = room.addClient(peer)
	logger.log(`Assigned symbol: ${symbol} to ${peer.id}`)

	if (!symbol) {
		logger.log('Room is full')
		peer.send(
			serialize({
				type: 'GAME_FULL',
				payload: 'Room is full',
			})
		)
		return
	}

	peer.roomId = roomId
	peer.send(
		serialize({
			type: 'PLAYER_ASSIGNED',
			payload: {
				symbol,
				gameState: room.gameState,
			},
		})
	)

	room.broadcastPlayerCount()
	logger.log('Room status:', {
		roomId,
		players: room.clientCount,
		symbol,
	})
}

function handleMakeMove(peer: any, payload: Payload) {
	const { roomId } = peer
	if (!roomId) {
		logger.error('No room ID found for peer')
		return
	}

	const room = roomManager.getRoom(roomId)
	if (!room) {
		logger.error('Room not found:', roomId)
		return
	}

	const { boardId, squareId, player } = payload
	if (!room.isValidMove(peer, boardId, squareId, player)) {
		logger.log('Invalid move:', { boardId, squareId, player })
		peer.send(
			serialize({
				type: 'INVALID_MOVE',
				payload: 'Invalid move',
			})
		)
		return
	}

	room.executeMove(boardId, squareId, player)
	room.broadcastGameState()
	logger.log('Move executed:', {
		roomId,
		boardId,
		squareId,
		player,
	})
}

function handlePeerDisconnection(peer: any) {
	const { roomId } = peer
	if (!roomId) return

	try {
		const room = roomManager.getRoom(roomId)
		if (!room) return

		room.removeClient(peer)
		logger.log('Client removed from room:', {
			roomId,
			remainingPlayers: room.clientCount,
		})

		if (room.clientCount === 0) {
			roomManager.removeRoom(roomId)
			logger.log('Room removed:', roomId)
		} else {
			room.broadcastPlayerCount()
		}
	} catch (error) {
		logger.error('Error handling peer disconnection:', error)
	}
}
