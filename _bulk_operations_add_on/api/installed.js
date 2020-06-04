export default (req, res) => {
  console.log(req);
  res.status(200).send({ message: 'gotcha' });
};
