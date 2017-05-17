package org.hisp.dhis.predictor;

/*
 * Copyright (c) 2004-2016, University of Oslo
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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.hisp.dhis.DhisSpringTest;
import org.hisp.dhis.IntegrationTest;
import org.hisp.dhis.analytics.AggregationType;
import org.hisp.dhis.common.ValueType;
import org.hisp.dhis.dataelement.DataElement;
import org.hisp.dhis.dataelement.DataElementCategory;
import org.hisp.dhis.dataelement.DataElementCategoryCombo;
import org.hisp.dhis.dataelement.DataElementCategoryOption;
import org.hisp.dhis.dataelement.DataElementCategoryOptionCombo;
import org.hisp.dhis.dataelement.DataElementCategoryService;
import org.hisp.dhis.dataelement.DataElementService;
import org.hisp.dhis.dataset.DataSet;
import org.hisp.dhis.dataset.DataSetService;
import org.hisp.dhis.datavalue.DataValue;
import org.hisp.dhis.datavalue.DataValueService;
import org.hisp.dhis.expression.Expression;
import org.hisp.dhis.expression.ExpressionService;
import org.hisp.dhis.organisationunit.OrganisationUnit;
import org.hisp.dhis.organisationunit.OrganisationUnitLevel;
import org.hisp.dhis.organisationunit.OrganisationUnitService;
import org.hisp.dhis.period.Period;
import org.hisp.dhis.period.PeriodType;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.Assert.*;

/**
 * @author Lars Helge Overland
 */
public class PredictorServiceTest
    extends DhisSpringTest 
{
    @Autowired
    private PredictorService predictorService;

    @Autowired
    private DataElementService dataElementService;

    @Autowired
    private OrganisationUnitService organisationUnitService;

    @Autowired
    private DataElementCategoryService categoryService;

    @Autowired
    private ExpressionService expressionService;

    @Autowired
    private DataValueService dataValueService;

    @Autowired
    private DataSetService dataSetService;

    private OrganisationUnitLevel orgUnitLevel1;
    
    private DataElement dataElementA;

    private DataElement dataElementB;

    private DataElement dataElementC;

    private DataElement dataElementD;

    private DataElement dataElementX;

    private DataElementCategoryOptionCombo defaultCombo;

    private DataElementCategoryOptionCombo altCombo;

    DataElementCategoryOption altCategoryOption;
    DataElementCategory altDataElementCategory;
    DataElementCategoryCombo altDataElementCategoryCombo;

    private Set<DataElement> dataElements;

    private OrganisationUnit sourceA, sourceB, sourceC, sourceD, sourceE, sourceF, sourceG;

    private Set<DataElementCategoryOptionCombo> optionCombos;

    private Expression expressionA;

    private Expression expressionB;

    private PeriodType periodTypeMonthly;

    private DataSet dataSetMonthly;

    // -------------------------------------------------------------------------
    // Fixture
    // -------------------------------------------------------------------------

    @Override
    public void setUpTest()
        throws Exception
    {
        orgUnitLevel1 = new OrganisationUnitLevel( 1, "Level1" );
        
        dataElementA = createDataElement( 'A' );
        dataElementB = createDataElement( 'B' );
        dataElementC = createDataElement( 'C' );
        dataElementD = createDataElement( 'D' );
        dataElementX = createDataElement( 'X', ValueType.NUMBER, AggregationType.NONE );

        dataElementService.addDataElement( dataElementA );
        dataElementService.addDataElement( dataElementB );
        dataElementService.addDataElement( dataElementC );
        dataElementService.addDataElement( dataElementD );
        dataElementService.addDataElement( dataElementX );

        dataElements = new HashSet<>();

        dataElements.add( dataElementA );
        dataElements.add( dataElementB );
        dataElements.add( dataElementC );
        dataElements.add( dataElementD );

        sourceA = createOrganisationUnit( 'A' );
        sourceB = createOrganisationUnit( 'B' );
        sourceC = createOrganisationUnit( 'C', sourceB );
        sourceD = createOrganisationUnit( 'D', sourceB );
        sourceE = createOrganisationUnit( 'E', sourceD );
        sourceF = createOrganisationUnit( 'F', sourceD );
        sourceG = createOrganisationUnit( 'G' );

        organisationUnitService.addOrganisationUnit( sourceA );
        organisationUnitService.addOrganisationUnit( sourceB );
        organisationUnitService.addOrganisationUnit( sourceC );
        organisationUnitService.addOrganisationUnit( sourceD );
        organisationUnitService.addOrganisationUnit( sourceE );
        organisationUnitService.addOrganisationUnit( sourceF );
        organisationUnitService.addOrganisationUnit( sourceG );

        periodTypeMonthly = PeriodType.getPeriodTypeByName( "Monthly" );
        dataSetMonthly = createDataSet( 'M', periodTypeMonthly );
        
        dataSetMonthly.addDataSetElement( dataElementA );
        dataSetMonthly.addDataSetElement( dataElementB );
        dataSetMonthly.addDataSetElement( dataElementC );
        dataSetMonthly.addDataSetElement( dataElementD );
        dataSetMonthly.addDataSetElement( dataElementX );

        dataSetMonthly.addOrganisationUnit( sourceA );
        dataSetMonthly.addOrganisationUnit( sourceB );
        dataSetMonthly.addOrganisationUnit( sourceC );
        dataSetMonthly.addOrganisationUnit( sourceD );
        dataSetMonthly.addOrganisationUnit( sourceE );
        dataSetMonthly.addOrganisationUnit( sourceG );
        
        dataSetService.addDataSet( dataSetMonthly );
        
        DataElementCategoryOptionCombo categoryOptionCombo = categoryService.getDefaultDataElementCategoryOptionCombo();

        defaultCombo = categoryService.getDefaultDataElementCategoryOptionCombo();

        altCategoryOption = new DataElementCategoryOption( "AltCategoryOption" );
        categoryService.addDataElementCategoryOption( altCategoryOption );
        altDataElementCategory = createDataElementCategory( 'A', altCategoryOption );
        categoryService.addDataElementCategory( altDataElementCategory );

        altDataElementCategoryCombo = createCategoryCombo( 'Y', altDataElementCategory );
        categoryService.addDataElementCategoryCombo( altDataElementCategoryCombo );

        altCombo = createCategoryOptionCombo( 'Z', altDataElementCategoryCombo, altCategoryOption );

        optionCombos = new HashSet<>();
        optionCombos.add( categoryOptionCombo );
        optionCombos.add( altCombo );

        categoryService.addDataElementCategoryOptionCombo( altCombo );

        expressionA = new Expression(
            "AVG(#{" + dataElementA.getUid() + "})+" + "1.5*STDEV(#{" + dataElementA.getUid() + "})", "descriptionA" );
        expressionB = new Expression( "expressionB", "descriptionB" );

        expressionService.addExpression( expressionB );
        expressionService.addExpression( expressionA );
    }

    // -------------------------------------------------------------------------
    // Supportive methods
    // -------------------------------------------------------------------------

    private Period makeMonth( int year, int month )
    {
        Date start = getDate( year, month, 1 );
        Period period = periodTypeMonthly.createPeriod( start );
        Date end = getDate( year, month, period.getDaysInPeriod() );
        return createPeriod( periodTypeMonthly, start, end );
    }

    private Date monthStart( int year, int month )
    {
        DateTime starting = new DateTime( year, month, 1, 0, 0 );

        return starting.toDate();
    }

    private void useDataValue( DataElement e, Period p, OrganisationUnit s, Number value )
    {
        dataValueService.addDataValue( createDataValue( e, p, s, value.toString(), defaultCombo, defaultCombo ) );
    }

    private Double getPredictionAt( Collection<DataValue> predictions, OrganisationUnit unit, Period period )
    {
        for ( DataValue dv : predictions )
        {
            if ( ( unit == dv.getSource() ) && ( period.equals( dv.getPeriod() ) ) )
            {
                return Double.valueOf( dv.getValue() );
            }
        }

        return null;
    }


    private Double getPredictionAt( Collection<DataValue> predictions, DataElementCategoryOptionCombo combo, OrganisationUnit unit, Period period )
    {
        for ( DataValue dv : predictions )
        {
            if ( ( unit == dv.getSource() ) && ( period.equals( dv.getPeriod() ) &&
                ( combo == dv.getCategoryOptionCombo() )))
            {
                return Double.valueOf( dv.getValue() );
            }
        }

        return null;
    }

    private Double getDataValue( DataElement dataElement, OrganisationUnit source, Period period )
    {
        Collection<DataValue> results = dataValueService.getDataValues( Sets.newHashSet( dataElement ), Sets.newHashSet( period ), Sets.newHashSet( source ) );

        for ( DataValue v : results )
        {
            return Double.valueOf( v.getValue() );
        }

        return null;
    }

    private Double getDataValue( DataElement dataElement, DataElementCategoryOptionCombo combo, OrganisationUnit source, Period period )
    {
        DataValue v =  dataValueService.getDataValue( dataElement, period, source, combo, defaultCombo );

        if ( v != null )
        {
            return Double.valueOf( v.getValue() );
        }

        return null;
    }

    private void setupTestData()
    {
        useDataValue( dataElementA, makeMonth( 2001, 6 ), sourceA, 5 );
        useDataValue( dataElementA, makeMonth( 2001, 7 ), sourceA, 3 );
        useDataValue( dataElementA, makeMonth( 2001, 8 ), sourceA, 8 );
        useDataValue( dataElementA, makeMonth( 2001, 9 ), sourceA, 4 );
        useDataValue( dataElementA, makeMonth( 2001, 10 ), sourceA, 7 );

        useDataValue( dataElementA, makeMonth( 2002, 6 ), sourceA, 8 );
        useDataValue( dataElementA, makeMonth( 2002, 7 ), sourceA, 4 );
        useDataValue( dataElementA, makeMonth( 2002, 8 ), sourceA, 10 );
        useDataValue( dataElementA, makeMonth( 2002, 9 ), sourceA, 5 );
        useDataValue( dataElementA, makeMonth( 2002, 10 ), sourceA, 7 );

        useDataValue( dataElementA, makeMonth( 2003, 5 ), sourceA, 9 );
        useDataValue( dataElementA, makeMonth( 2003, 6 ), sourceA, 11 );
        useDataValue( dataElementA, makeMonth( 2003, 7 ), sourceA, 6 );
        useDataValue( dataElementA, makeMonth( 2003, 8 ), sourceA, 7 );
        useDataValue( dataElementA, makeMonth( 2003, 9 ), sourceA, 9 );
        useDataValue( dataElementA, makeMonth( 2003, 10 ), sourceA, 10 );

        useDataValue( dataElementB, makeMonth( 2003, 6 ), sourceA, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 7 ), sourceA, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 8 ), sourceA, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 9 ), sourceA, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 10 ), sourceA, 1 );

        useDataValue( dataElementA, makeMonth( 2004, 5 ), sourceA, 4 );
        useDataValue( dataElementA, makeMonth( 2004, 6 ), sourceA, 8 );
        useDataValue( dataElementA, makeMonth( 2004, 7 ), sourceA, 4 );
        useDataValue( dataElementA, makeMonth( 2004, 8 ), sourceA, 7 );
        useDataValue( dataElementA, makeMonth( 2004, 9 ), sourceA, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 10 ), sourceA, 6 );

        useDataValue( dataElementB, makeMonth( 2003, 5 ), sourceC, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 6 ), sourceC, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 7 ), sourceC, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 5 ), sourceE, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 6 ), sourceE, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 7 ), sourceE, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 5 ), sourceF, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 6 ), sourceF, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 7 ), sourceF, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 9 ), sourceF, 1 );
        useDataValue( dataElementB, makeMonth( 2003, 10 ), sourceF, 1 );

        useDataValue( dataElementA, makeMonth( 2001, 6 ), sourceC, 6 );
        useDataValue( dataElementA, makeMonth( 2001, 7 ), sourceC, 4 );
        useDataValue( dataElementA, makeMonth( 2001, 8 ), sourceC, 7 );
        useDataValue( dataElementA, makeMonth( 2001, 9 ), sourceC, 4 );
        useDataValue( dataElementA, makeMonth( 2001, 10 ), sourceC, 7 );

        useDataValue( dataElementA, makeMonth( 2002, 6 ), sourceC, 7 );
        useDataValue( dataElementA, makeMonth( 2002, 7 ), sourceC, 4 );
        useDataValue( dataElementA, makeMonth( 2002, 8 ), sourceC, 11 );
        useDataValue( dataElementA, makeMonth( 2002, 9 ), sourceC, 5 );
        useDataValue( dataElementA, makeMonth( 2002, 10 ), sourceC, 6 );

        useDataValue( dataElementA, makeMonth( 2003, 5 ), sourceC, 10 );
        useDataValue( dataElementA, makeMonth( 2003, 6 ), sourceC, 10 );
        useDataValue( dataElementA, makeMonth( 2003, 7 ), sourceC, 7 );
        useDataValue( dataElementA, makeMonth( 2003, 8 ), sourceC, 7 );
        useDataValue( dataElementA, makeMonth( 2003, 9 ), sourceC, 8 );
        useDataValue( dataElementA, makeMonth( 2003, 10 ), sourceC, 9 );

        useDataValue( dataElementA, makeMonth( 2004, 5 ), sourceC, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 6 ), sourceC, 9 );
        useDataValue( dataElementA, makeMonth( 2004, 7 ), sourceC, 6 );
        useDataValue( dataElementA, makeMonth( 2004, 8 ), sourceC, 7 );
        useDataValue( dataElementA, makeMonth( 2004, 9 ), sourceC, 6 );
        useDataValue( dataElementA, makeMonth( 2004, 10 ), sourceC, 5 );

        useDataValue( dataElementA, makeMonth( 2001, 6 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2001, 7 ), sourceE, 1 );
        useDataValue( dataElementA, makeMonth( 2001, 8 ), sourceE, 3 );
        useDataValue( dataElementA, makeMonth( 2001, 9 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2001, 10 ), sourceE, 1 );

        useDataValue( dataElementA, makeMonth( 2002, 6 ), sourceE, 3 );
        useDataValue( dataElementA, makeMonth( 2002, 7 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2002, 8 ), sourceE, 1 );
        useDataValue( dataElementA, makeMonth( 2002, 9 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2002, 10 ), sourceE, 2 );

        useDataValue( dataElementA, makeMonth( 2003, 5 ), sourceE, 4 );
        useDataValue( dataElementA, makeMonth( 2003, 6 ), sourceE, 4 );
        useDataValue( dataElementA, makeMonth( 2003, 7 ), sourceE, 3 );
        useDataValue( dataElementA, makeMonth( 2003, 8 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2003, 9 ), sourceE, 2 );
        useDataValue( dataElementA, makeMonth( 2003, 10 ), sourceE, 1 );

        useDataValue( dataElementA, makeMonth( 2004, 5 ), sourceE, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 6 ), sourceE, 7 );
        useDataValue( dataElementA, makeMonth( 2004, 7 ), sourceE, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 8 ), sourceE, 4 );
        useDataValue( dataElementA, makeMonth( 2004, 9 ), sourceE, 4 );
        useDataValue( dataElementA, makeMonth( 2004, 10 ), sourceE, 3 );

        useDataValue( dataElementA, makeMonth( 2001, 6 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2001, 7 ), sourceF, 2 );
        useDataValue( dataElementA, makeMonth( 2001, 8 ), sourceF, 4 );
        useDataValue( dataElementA, makeMonth( 2001, 9 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2001, 10 ), sourceF, 2 );

        useDataValue( dataElementA, makeMonth( 2002, 6 ), sourceF, 4 );
        useDataValue( dataElementA, makeMonth( 2002, 7 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2002, 8 ), sourceF, 2 );
        useDataValue( dataElementA, makeMonth( 2002, 9 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2002, 10 ), sourceF, 3 );

        useDataValue( dataElementA, makeMonth( 2003, 5 ), sourceF, 5 );
        useDataValue( dataElementA, makeMonth( 2003, 6 ), sourceF, 5 );
        useDataValue( dataElementA, makeMonth( 2003, 7 ), sourceF, 4 );
        useDataValue( dataElementA, makeMonth( 2003, 8 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2003, 9 ), sourceF, 3 );
        useDataValue( dataElementA, makeMonth( 2003, 10 ), sourceF, 2 );

        useDataValue( dataElementA, makeMonth( 2004, 5 ), sourceF, 6 );
        useDataValue( dataElementA, makeMonth( 2004, 6 ), sourceF, 8 );
        useDataValue( dataElementA, makeMonth( 2004, 7 ), sourceF, 6 );
        useDataValue( dataElementA, makeMonth( 2004, 8 ), sourceF, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 9 ), sourceF, 5 );
        useDataValue( dataElementA, makeMonth( 2004, 10 ), sourceF, 4 );
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    @Test
    public void testSaveGetPredictor()
    {
        Predictor predictor = createPredictor( dataElementX, defaultCombo, "A", expressionA, expressionB, periodTypeMonthly, orgUnitLevel1,
            6, 1, 0 );
        Set<OrganisationUnitLevel> levels = new HashSet<OrganisationUnitLevel>();
        levels.add( orgUnitLevel1 );

        int id = predictorService.addPredictor( predictor );

        predictor = predictorService.getPredictor( id );

        assertEquals( predictor.getName(), "PredictorA" );
        assertEquals( predictor.getDescription(), "DescriptionA" );
        assertNotNull( predictor.getGenerator().getExpression() );
        // TODO Need a good skipTest test
        assertEquals( predictor.getPeriodType(), periodTypeMonthly );
        assertEquals( predictor.getOutput(), dataElementX );
        assertEquals( predictor.getAnnualSampleCount(), new Integer( 0 ) );
        assertEquals( predictor.getSequentialSampleCount(), new Integer( 6 ) );
        assertEquals( predictor.getSequentialSkipCount(), new Integer( 1 ) );
        assertEquals( predictor.getOrganisationUnitLevels(), levels );
    }

    @Test
    public void testSaveGetPredictorAlt()
    {
        Predictor predictor = createPredictor( dataElementX, altCombo, "B", expressionA, expressionB, periodTypeMonthly, orgUnitLevel1,
            6, 1, 0 );
        Set<OrganisationUnitLevel> levels = new HashSet<OrganisationUnitLevel>();
        levels.add( orgUnitLevel1 );

        int id = predictorService.addPredictor( predictor );

        predictor = predictorService.getPredictor( id );

        assertEquals( predictor.getName(), "PredictorB" );
        assertEquals( predictor.getDescription(), "DescriptionB" );
        assertNotNull( predictor.getGenerator().getExpression() );
        // TODO Need a good skipTest test
        assertEquals( predictor.getPeriodType(), periodTypeMonthly );
        assertEquals( predictor.getOutput(), dataElementX );
        assertEquals( predictor.getAnnualSampleCount(), new Integer( 0 ) );
        assertEquals( predictor.getSequentialSampleCount(), new Integer( 6 ) );
        assertEquals( predictor.getSequentialSkipCount(), new Integer( 1 ) );
        assertEquals( predictor.getOrganisationUnitLevels(), levels );
    }

    @Test
    public void testUpdatePredictor()
    {
        Predictor predictor = createPredictor( dataElementX, altCombo, "A", expressionA, expressionB, periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );

        int id = predictorService.addPredictor( predictor );

        predictor = predictorService.getPredictor( id );

        assertEquals( predictor.getName(), "PredictorA" );
        assertEquals( predictor.getDescription(), "DescriptionA" );
        assertNotNull( predictor.getGenerator().getExpression() );
        assertEquals( predictor.getPeriodType(), periodTypeMonthly );

        predictor.setName( "PredictorB" );
        predictor.setDescription( "DescriptionB" );
        predictor.setSequentialSkipCount( 2 );

        predictorService.updatePredictor( predictor );

        predictor = predictorService.getPredictor( id );

        assertEquals( predictor.getName(), "PredictorB" );
        assertEquals( predictor.getDescription(), "DescriptionB" );
        assertEquals( predictor.getSequentialSkipCount(), new Integer( 2 ) );

    }

    @Test
    public void testDeletePredictor()
    {
        Predictor predictorA = createPredictor( dataElementX, defaultCombo, "A", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );
        Predictor predictorB = createPredictor( dataElementX, altCombo, "B", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );

        int idA = predictorService.addPredictor( predictorA );
        int idB = predictorService.addPredictor( predictorB );

        assertNotNull( predictorService.getPredictor( idA ) );
        assertNotNull( predictorService.getPredictor( idB ) );

        predictorA.clearExpressions();

        predictorService.deletePredictor( predictorA );

        assertNull( predictorService.getPredictor( idA ) );
        assertNotNull( predictorService.getPredictor( idB ) );

        predictorB.clearExpressions();

        predictorService.deletePredictor( predictorB );

        assertNull( predictorService.getPredictor( idA ) );
        assertNull( predictorService.getPredictor( idB ) );
    }

    @Test
    public void testGetAllPredictors()
    {
        Predictor predictorA = createPredictor( dataElementX, defaultCombo, "A", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );
        Predictor predictorB = createPredictor( dataElementX, altCombo, "B", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );

        predictorService.addPredictor( predictorA );
        predictorService.addPredictor( predictorB );

        List<Predictor> predictors = predictorService.getAllPredictors();

        assertTrue( predictors.size() == 2 );
        assertTrue( predictors.contains( predictorA ) );
        assertTrue( predictors.contains( predictorB ) );
    }

    @Test
    public void testGetPredictorByName()
    {
        Predictor predictorA = createPredictor( dataElementX, defaultCombo, "A", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );
        Predictor predictorB = createPredictor( dataElementX, altCombo, "B", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );

        int id = predictorService.addPredictor( predictorA );
        predictorService.addPredictor( predictorB );

        List<Predictor> p = predictorService.getPredictorsByName( "PredictorA" );

        assertEquals( p.size(), 1 );
        assertEquals( p.get( 0 ).getId(), id );

        assertEquals( p.get( 0 ).getName(), "PredictorA" );
    }

    @Test
    public void testGetPredictorCount()
    {
        Set<DataElement> dataElementsA = new HashSet<>();
        dataElementsA.add( dataElementA );
        dataElementsA.add( dataElementB );

        Set<DataElement> dataElementsB = new HashSet<>();
        dataElementsB.add( dataElementC );
        dataElementsB.add( dataElementD );

        Set<DataElement> dataElementsD = new HashSet<>();
        dataElementsD.addAll( dataElementsA );
        dataElementsD.addAll( dataElementsB );

        Expression expression1 = new Expression( "Expression1", "Expression1" );
        Expression expression2 = new Expression( "Expression2", "Expression2" );
        Expression expression3 = new Expression( "Expression3", "Expression3" );

        expressionService.addExpression( expression1 );
        expressionService.addExpression( expression2 );
        expressionService.addExpression( expression3 );

        Predictor predictorA = createPredictor( dataElementX, altCombo, "A", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );
        Predictor predictorB = createPredictor( dataElementX, defaultCombo, "B", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );
        Predictor predictorC = createPredictor( dataElementX, altCombo, "C", expressionA, expressionB,
            periodTypeMonthly, orgUnitLevel1, 6, 1, 0 );

        predictorService.addPredictor( predictorA );
        predictorService.addPredictor( predictorB );
        predictorService.addPredictor( predictorC );

        assertNotNull( predictorService.getPredictorCount() );
        assertEquals( 3, predictorService.getPredictorCount() );
    }

    @Test
    @Category( IntegrationTest.class )
    public void testGetPredictionsSequential()
    {
        setupTestData();
        
        String auid = dataElementA.getUid();
        Predictor p = createPredictor( dataElementX, defaultCombo, "GetPredictionsSequential",
            new Expression( "AVG(#{" + auid + "})+1.5*STDDEV(#{" + auid + "})", "descriptionA" ),
            null, periodTypeMonthly, orgUnitLevel1, 3, 1, 0 );

        Iterable<DataValue> stream = predictorService.getPredictions( p, monthStart( 2001, 7 ),
            monthStart( 2001, 12 ) );
        List<DataValue> predictions = Lists.newArrayList( stream );

        // displayDataValues( predictions );

        assertEquals( 8, predictions.size() );
        assertEquals( new Double( 5.0 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 8 ) ) );
        assertEquals( new Double( 5.5 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 9 ) ) );
        assertNull( getPredictionAt( predictions, altCombo, sourceA, makeMonth( 2001, 9 ) ) );
    }

    @Test
    @Category( IntegrationTest.class )
    public void testGetPredictionsSeasonal()
    {
        setupTestData();
        
        String auid = dataElementA.getUid();
        Predictor p = createPredictor( dataElementX, altCombo, "GetPredictionsSeasonal",
            new Expression( "AVG(#{" + auid + "})+1.5*STDDEV(#{" + auid + "})", "descriptionA" ),
            null, periodTypeMonthly, orgUnitLevel1, 3, 1, 2 );

        Iterable<DataValue> stream = predictorService.getPredictions( p, monthStart( 2001, 7 ),
            monthStart( 2005, 12 ) );
        List<DataValue> predictions = Lists.newArrayList( stream );

        // displayDataValues(predictions);
        assertEquals( 100, predictions.size() );
        assertEquals( new Double( 5.0 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 8 ) ) );
        assertEquals( new Double( 5.5 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 10.93693177121688 ), getPredictionAt( predictions, sourceA, makeMonth( 2004, 7 ) ) );
        assertEquals( new Double( 10.846601043114951 ), getPredictionAt( predictions, sourceA, makeMonth( 2004, 8 ) ) );
        // This value is derived from organisation units beneath the actual *sourceB*.
        assertEquals( new Double( 18.143692420072007 ), getPredictionAt( predictions, sourceB, makeMonth( 2004, 7 ) ) );

        assertNull( getPredictionAt( predictions, defaultCombo, sourceA, makeMonth( 2001, 9 ) ) );
    }

    @Test
    @Category( IntegrationTest.class )
    public void testGetPredictionsSeasonalWithOutbreak()
    {
        setupTestData();
        
        String auid = dataElementA.getUid();
        Predictor p = createPredictor( dataElementX, altCombo, "GetPredictionsSeasonalWithOutbreak",
            new Expression( "AVG(#{" + auid + "})+1.5*STDDEV(#{" + auid + "})", "descriptionA" ),
            new Expression( "#{" + dataElementB.getUid() + "}", "outbreak" ), 
            periodTypeMonthly, orgUnitLevel1, 3, 1, 2 );

        Iterable<DataValue> stream = predictorService.getPredictions( p, monthStart( 2001, 7 ),
            monthStart( 2005, 12 ) );
        List<DataValue> predictions = Lists.newArrayList( stream );

        assertEquals( 99, predictions.size() );
        assertEquals( new Double( 5.0 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 8 ) ) );
        assertEquals( new Double( 5.5 ), getPredictionAt( predictions, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 10.088860517433634 ), getPredictionAt( predictions, sourceA, makeMonth( 2004, 7 ) ) );
        assertEquals( new Double( 10.095418256997062 ), getPredictionAt( predictions, sourceA, makeMonth( 2004, 8 ) ) );
        // This value is derived from organisation units beneath the actual *sourceB*.
        assertEquals( new Double( 15.754231583479712 ), getPredictionAt( predictions, sourceB, makeMonth( 2004, 7 ) ) );
    }

    @Test
    @Category( IntegrationTest.class )
    public void testPredictSequential()
    {
        setupTestData();

        String auid = dataElementA.getUid();
        Predictor p = createPredictor( dataElementX, defaultCombo, "PredictSequential",
            new Expression( "AVG(#{" + auid + "})+1.5*STDDEV(#{" + auid + "})", "descriptionA" ),
            null, periodTypeMonthly, orgUnitLevel1, 3, 1, 0 );

        predictorService.predict( p, monthStart( 2001, 7 ), monthStart( 2001, 12 ) );

        assertEquals( new Double( 5.5 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 5.0 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 8 ) ) );
        assertNull( getDataValue( dataElementX, altCombo, sourceA, makeMonth( 2001, 8 ) ) );

        // Make sure we can do it again.
        predictorService.predict( p, monthStart( 2001, 7 ), monthStart( 2001, 12 ) );

        assertEquals( new Double( 5.5 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 5.0 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 8 ) ) );
        assertNull( getDataValue( dataElementX, altCombo, sourceA, makeMonth( 2001, 8 ) ) );
    }

    @Test
    @Category( IntegrationTest.class )
    public void testPredictSequentialAltCombo()
    {
        setupTestData();

        String auid = dataElementA.getUid();
        Predictor p = createPredictor( dataElementX, altCombo, "PredictSequential",
            new Expression( "AVG(#{" + auid + "})+1.5*STDDEV(#{" + auid + "})", "descriptionA" ),
            null, periodTypeMonthly, orgUnitLevel1, 3, 1, 0 );

        predictorService.predict( p, monthStart( 2001, 7 ), monthStart( 2001, 12 ) );

        assertEquals( new Double( 5.5 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 5.0 ), getDataValue( dataElementX, sourceA, makeMonth( 2001, 8 ) ) );

        assertEquals( new Double( 5.5 ), getDataValue( dataElementX, altCombo, sourceA, makeMonth( 2001, 9 ) ) );
        assertEquals( new Double( 5.0 ), getDataValue( dataElementX, altCombo, sourceA, makeMonth( 2001, 8 ) ) );

        assertNull( getDataValue( dataElementX, defaultCombo, sourceA, makeMonth( 2001, 8 ) ) );

    }
}
