package org.hisp.dhis.resourcetable.table;

/*
 * Copyright (c) 2004-2017, University of Oslo
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * Neither the name of the HISP project nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.hisp.dhis.calendar.Calendar;
import org.hisp.dhis.common.IdentifiableObjectUtils;
import org.hisp.dhis.period.BiMonthlyPeriodType;
import org.hisp.dhis.period.DailyPeriodType;
import org.hisp.dhis.period.MonthlyPeriodType;
import org.hisp.dhis.period.Period;
import org.hisp.dhis.period.PeriodType;
import org.hisp.dhis.period.QuarterlyPeriodType;
import org.hisp.dhis.period.SixMonthlyAprilPeriodType;
import org.hisp.dhis.period.SixMonthlyPeriodType;
import org.hisp.dhis.period.WeeklyPeriodType;
import org.hisp.dhis.resourcetable.ResourceTable;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

/**
 * @author Abyot Asalefew Gizaw <abyot@dhis2.org>
 *
 */
public class LastPeriodResourceTable
    extends ResourceTable<Period>
{
    
    private static final Map<String, Integer> PERIOD_INDEX = ImmutableMap.<String, Integer> builder()
        .put( DailyPeriodType.NAME, 6 ).put( WeeklyPeriodType.NAME, 5 ).put( MonthlyPeriodType.NAME, 4 )
        .put( BiMonthlyPeriodType.NAME, 5 ).put( QuarterlyPeriodType.NAME, 5 )
        .put( SixMonthlyPeriodType.NAME, 5 ).put( SixMonthlyAprilPeriodType.NAME, 10 ).build();
    
    
    public LastPeriodResourceTable( List<Period> objects, String columnQuote )
    {
        super( objects, columnQuote );
    }

    @Override
    public String getTableName()
    {
        return "_lastperiodstructure";
    }

    @Override
    public String getCreateTempTableStatement()
    {
        String sql = "CREATE TABLE " + getTempTableName()
            + " (periodid INTEGER NOT NULL PRIMARY KEY, iso VARCHAR(15) NOT NULL, daysno INTEGER NOT NULL, startdate DATE NOT NULL, enddate DATE NOT NULL";

        for ( PeriodType periodType : PeriodType.PERIOD_TYPES )
        {
            sql += ", " + columnQuote + periodType.getName().toLowerCase() + columnQuote + " VARCHAR(15)";
        }

        sql += ")";

        return sql;
    }

    @Override
    public Optional<String> getPopulateTempTableStatement()
    {
        return Optional.empty();
    }

    @Override
    public Optional<List<Object[]>> getPopulateTempTableContent()
    {
        Calendar calendar = PeriodType.getCalendar();

        List<Object[]> batchArgs = new ArrayList<>();

        Set<String> uniqueIsoDates = new HashSet<>();

        Map<String, Map<String, List<String>>> periodMap = new HashMap<>();

        for ( PeriodType periodType : PeriodType.PERIOD_TYPES )
        {
            Map<String, List<String>> prds = new HashMap<>();
            for ( Period period : objects )
            {                
                if ( period.getPeriodType().getFrequencyOrder() < periodType.getFrequencyOrder() )
                {
                    if( prds.containsKey( period.getPeriodType().getName() ) )
                    {
                        prds.get( period.getPeriodType().getName() ).add( period.getIsoDate() );
                    }
                    else
                    {
                        prds.put( period.getPeriodType().getName(), new ArrayList<> () );
                        prds.get( period.getPeriodType().getName() ).add( period.getIsoDate() );
                    }
                    
                    Collections.sort(  prds.get( period.getPeriodType().getName() ) );
                }
            }            

            periodMap.put( periodType.getName(), prds );
        }

        System.out.println( "Mapped periods: " + periodMap.toString() );

        for ( Period period : objects )
        {
            if ( period != null && period.isValid() )
            {
                final PeriodType rowType = period.getPeriodType();
                final String isoDate = period.getIsoDate();

                if ( !uniqueIsoDates.add( isoDate ) )
                {
                    log.warn( "Duplicate ISO date for period, ignoring: " + period + ", ISO date: " + isoDate );
                    continue;
                }

                List<Object> values = new ArrayList<>();

                values.add( period.getId() );
                values.add( isoDate );
                values.add( period.getDaysInPeriod() );
                values.add( period.getStartDate() );
                values.add( period.getEndDate() );
                
                /*for ( PeriodType periodType : PeriodType.PERIOD_TYPES )
                {                    
                    Object value = null;
                    
                    if ( rowType.getFrequencyOrder() < periodType.getFrequencyOrder() )
                    {                        
                        if(  PERIOD_INDEX.get( rowType.getName() ) != null )
                        {
                            int len = PERIOD_INDEX.get( rowType.getName() );                            
                            
                            if( isoDate.length() > len  && periodMap.get( periodType.getName() ) != null && periodMap.get( periodType.getName() ).get( rowType.getName() ) != null )
                            {
                                int idx = Integer.parseInt(  isoDate.substring( len, isoDate.length() ) );
                                
                                List<String> prds = new ArrayList<>( periodMap.get( periodType.getName() ).get( rowType.getName() ) );
                                
                                if ( periodType.getPeriodSpan( rowType ) > prds.size() )
                                {
                                    if ( idx == prds.size() )
                                    {
                                        Period targetPeriod = IdentifiableObjectUtils.getPeriodByPeriodType( period, periodType,
                                            calendar );                                        
                                        
                                        value = IdentifiableObjectUtils.getLocalPeriodIdentifier( targetPeriod, calendar );

                                    }
                                }
                                else
                                {                                    
                                    if ( idx % periodType.getPeriodSpan( rowType ) == 0 )
                                    {
                                        Period targetPeriod = IdentifiableObjectUtils.getPeriodByPeriodType( period, periodType,
                                            calendar );
                                        
                                        value = IdentifiableObjectUtils.getLocalPeriodIdentifier( targetPeriod, calendar );
                                    }
                                }
                            }
                        }
                    }
                    else if ( rowType.equals( periodType ) )
                    {                        
                        Period targetPeriod = IdentifiableObjectUtils.getPeriodByPeriodType( period, periodType,
                            calendar );                        
                        
                        value = IdentifiableObjectUtils.getLocalPeriodIdentifier( targetPeriod, calendar );
                    }
                    
                    values.add( value );
                    
                }*/

                for ( PeriodType periodType : PeriodType.PERIOD_TYPES )
                {                    
                    Object value = null;
                    
                    if ( rowType.getFrequencyOrder() < periodType.getFrequencyOrder() )
                    {                        
                        if(  PERIOD_INDEX.get( rowType.getName() ) != null )
                        {
                            int len = PERIOD_INDEX.get( rowType.getName() );                            
                            
                            if( isoDate.length() > len )
                            {
                                int idx = Integer.parseInt(  isoDate.substring( len, isoDate.length() ) );
                                
                                if ( idx % periodType.getPeriodSpan( rowType ) == 0 )
                                {
                                    Period targetPeriod = IdentifiableObjectUtils.getPeriodByPeriodType( period, periodType,
                                        calendar );
                                    
                                    value = IdentifiableObjectUtils.getLocalPeriodIdentifier( targetPeriod, calendar );
                                    
                                }
                            }
                        }
                    }
                    else if ( rowType.equals( periodType ) )
                    {                        
                        Period targetPeriod = IdentifiableObjectUtils.getPeriodByPeriodType( period, periodType,
                            calendar );                        
                        
                        value = IdentifiableObjectUtils.getLocalPeriodIdentifier( targetPeriod, calendar );
                    }
                    
                    values.add( value );
                    
                }

                batchArgs.add( values.toArray() );
            }
        }

        return Optional.of( batchArgs );

    }

    @Override
    public List<String> getCreateIndexStatements()
    {
        return Lists.newArrayList();
    }
}
