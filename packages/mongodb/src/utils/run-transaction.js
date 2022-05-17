export default async (fn, { client, currentSession }) => {
  const session = currentSession || await client.startSession();
  const previouslyStarted = session.inTransaction();
  if (!previouslyStarted) session.startTransaction();

  try {
    const r = await fn({ session });
    if (!previouslyStarted) await session.commitTransaction();
    return r;
  } catch (e) {
    if (!previouslyStarted) await session.abortTransaction();
    throw e;
  } finally {
    if (!previouslyStarted) session.endSession();
  }
};
