import { AnimatePresence, motion } from 'motion/react'

/** Notice after switching service: earlier answers were cleared, with a way back. */
export function UndoToast({ show, onUndo }: { show: boolean; onUndo: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="undo"
          className="toast"
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
        >
          <span>Started a fresh search. Your earlier answers were cleared.</span>
          <button type="button" className="toast-btn" onClick={onUndo}>
            Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
