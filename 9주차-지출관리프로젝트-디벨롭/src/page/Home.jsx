import ExpenditureCreate from '../components/ExpenditureCreate.jsx';
import SelectMonth from '../components/SelectMonth.jsx';
import ExpenditureTotal from '../components/ExpenditureTotal.jsx';
import ExpenditureList from '../components/ExpenditureList.jsx';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getExpenditureList } from '../api/expenditure/expenditure.js';
import { useQuery } from '@tanstack/react-query';
import Loading from '../components/common/Loading.jsx';
import Empty from '../components/common/Empty.jsx';

function Home() {

  const {
    data: expenditureList,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['expenditureList'],
    queryFn: getExpenditureList,
  });

  const [filterExpenditureList, setFilterExpenditureList] = useState([]);
  const [expenditureTotalMap, setExpenditureTotalMap] = useState(new Map());
  const [currentMonth, setCurrentMonth] = useState(2);
  const [allCategoryTotalPrice, setAllCategoryTotalPrice] = useState(0);

  useEffect(() => {
    const localStorageMonth = localStorage.getItem('currentMonth');
    setCurrentMonth(localStorageMonth ? +localStorageMonth : new Date().getMonth());
  }, []);

  const changeCurrentMonth = (selectedMonth) => {
    localStorage.setItem('currentMonth', selectedMonth);
    setCurrentMonth(selectedMonth);
  };

  useEffect(() => {
    const totalMap = new Map();
    let tempAllCategoryTotalPrice = 0;
    setFilterExpenditureList(
      expenditureList?.filter((expenditure) => {
        const isSameMonth = +expenditure.date.substring(5, 7) === currentMonth;

        if (isSameMonth) {
          const beforePrice = totalMap.has(expenditure.category) ? totalMap.get(expenditure.category) : 0;
          tempAllCategoryTotalPrice += expenditure.price;
          totalMap.set(expenditure.category, beforePrice + expenditure.price);
        }

        return isSameMonth;
      }),
    );

    setAllCategoryTotalPrice(tempAllCategoryTotalPrice);
    setExpenditureTotalMap(totalMap);
  }, [currentMonth, expenditureList]);

  return (
    <Main>
      <ExpenditureCreate />
      <SelectMonth currentMonth={currentMonth}
                   changeCurrentMonth={changeCurrentMonth} />
      {
        filterExpenditureList?.length === 0 ? <Empty /> :
          isPending ?
            <Loading /> :
            <>
              <ExpenditureTotal expenditureTotalMap={expenditureTotalMap}
                                allCategoryTotalPrice={allCategoryTotalPrice} />
              <ExpenditureList expenditureList={filterExpenditureList}
                               currentMonth={currentMonth} />
            </>
      }
    </Main>
  );
}

const Main = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

export default Home;
